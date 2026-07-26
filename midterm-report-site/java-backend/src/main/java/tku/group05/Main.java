package tku.group05;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class Main {
    private Main() {
    }

    public static void main(String[] args) throws IOException {
        int port = Optional.ofNullable(System.getenv("PORT"))
                .map(Integer::parseInt)
                .orElse(8080);

        ApplicationService service = new ApplicationService();
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/health", exchange ->
                respond(exchange, 200, "{\"status\":\"ok\"}"));
        server.createContext("/api/applications", exchange ->
                handleApplications(exchange, service));
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();

        System.out.printf("Group05 Java API started at http://localhost:%d%n", port);
    }

    private static void handleApplications(
            HttpExchange exchange,
            ApplicationService service
    ) throws IOException {
        applyCors(exchange.getResponseHeaders());

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            respond(exchange, 200, Json.writeApplications(service.findAll()));
            return;
        }

        if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            String body = new String(
                    exchange.getRequestBody().readAllBytes(),
                    StandardCharsets.UTF_8
            );

            try {
                ApplicationRequest request = Json.readRequest(body);
                CreateResult result = service.create(request);
                int status = result.created() ? 201 : 409;
                respond(exchange, status, Json.writeResult(result));
            } catch (IllegalArgumentException exception) {
                respond(exchange, 400, Json.writeError(exception.getMessage()));
            }
            return;
        }

        if ("PATCH".equalsIgnoreCase(exchange.getRequestMethod())) {
            try {
                long id = readApplicationId(exchange.getRequestURI().getPath());
                String body = new String(
                        exchange.getRequestBody().readAllBytes(),
                        StandardCharsets.UTF_8
                );
                Map<String, String> review = Json.readFields(body);
                String status = review.get("status");
                String reviewNote = review.getOrDefault("reviewNote", "");
                ActivityApplication application = service.updateStatus(
                                id,
                                status,
                                reviewNote
                        )
                        .orElse(null);
                if (application == null) {
                    respond(exchange, 404, Json.writeError("找不到指定的申請紀錄。"));
                } else {
                    respond(exchange, 200, Json.writeUpdatedApplication(application));
                }
            } catch (IllegalArgumentException exception) {
                respond(exchange, 400, Json.writeError(exception.getMessage()));
            }
            return;
        }

        if ("PUT".equalsIgnoreCase(exchange.getRequestMethod())) {
            try {
                long id = readApplicationId(exchange.getRequestURI().getPath());
                String body = new String(
                        exchange.getRequestBody().readAllBytes(),
                        StandardCharsets.UTF_8
                );
                ApplicationRequest request = Json.readRequest(body);
                CreateResult result = service.resubmit(id, request);
                if (result.application() == null) {
                    respond(exchange, 404, Json.writeError(result.message()));
                } else {
                    int status = result.created() ? 200 : 409;
                    respond(exchange, status, Json.writeResult(result));
                }
            } catch (IllegalArgumentException exception) {
                respond(exchange, 400, Json.writeError(exception.getMessage()));
            }
            return;
        }

        respond(exchange, 405, Json.writeError("不支援的 HTTP 方法。"));
    }

    private static long readApplicationId(String path) {
        String prefix = "/api/applications/";
        if (!path.startsWith(prefix) || path.length() <= prefix.length()) {
            throw new IllegalArgumentException("請在網址中提供申請編號。");
        }
        try {
            return Long.parseLong(path.substring(prefix.length()));
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("申請編號格式不正確。");
        }
    }

    private static void applyCors(Headers headers) {
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Headers", "Content-Type");
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, OPTIONS");
    }

    private static void respond(HttpExchange exchange, int status, String body)
            throws IOException {
        byte[] response = body.getBytes(StandardCharsets.UTF_8);
        Headers headers = exchange.getResponseHeaders();
        applyCors(headers);
        headers.set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, response.length);
        exchange.getResponseBody().write(response);
        exchange.close();
    }
}

record ApplicationRequest(
        String activityName,
        String date,
        String startTime,
        String endTime,
        String venue,
        String description
) {
}

record ActivityApplication(
        long id,
        String activityName,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String venue,
        String description,
        String status,
        String reviewNote,
        int revision
) {
}

record CreateResult(
        boolean created,
        String message,
        ActivityApplication application
) {
}

final class ApplicationService {
    private final List<ActivityApplication> applications = new ArrayList<>();
    private long nextId = 1;

    synchronized List<ActivityApplication> findAll() {
        return List.copyOf(applications.reversed());
    }

    synchronized CreateResult create(ApplicationRequest request) {
        ValidatedInput input = validate(request);
        ActivityApplication conflict = findConflict(input, -1);

        if (conflict != null) {
            String message = "場地衝突：%s 在 %s %s–%s 已有申請，系統禁止送出。"
                    .formatted(
                            conflict.venue(),
                            conflict.date(),
                            conflict.startTime(),
                            conflict.endTime()
                    );
            return new CreateResult(false, message, conflict);
        }

        ActivityApplication application = new ActivityApplication(
                nextId++,
                input.activityName(),
                input.date(),
                input.startTime(),
                input.endTime(),
                input.venue(),
                input.description(),
                "待審核",
                "",
                1
        );
        applications.add(application);

        return new CreateResult(
                true,
                "申請建立成功，狀態已由「建立中」更新為「待審核」。",
                application
        );
    }

    synchronized Optional<ActivityApplication> updateStatus(
            long id,
            String status,
            String reviewNote
    ) {
        if (!"已核准".equals(status)
                && !"待補件".equals(status)
                && !"已退回".equals(status)) {
            throw new IllegalArgumentException(
                    "審核狀態只能是「已核准」、「待補件」或「已退回」。"
            );
        }
        if (!"已核准".equals(status) && isBlank(reviewNote)) {
            throw new IllegalArgumentException("要求補件或退回時必須填寫原因。");
        }

        for (int index = 0; index < applications.size(); index++) {
            ActivityApplication current = applications.get(index);
            if (current.id() == id) {
                ActivityApplication updated = new ActivityApplication(
                        current.id(),
                        current.activityName(),
                        current.date(),
                        current.startTime(),
                        current.endTime(),
                        current.venue(),
                        current.description(),
                        status,
                        reviewNote == null ? "" : reviewNote.trim(),
                        current.revision()
                );
                applications.set(index, updated);
                return Optional.of(updated);
            }
        }
        return Optional.empty();
    }

    synchronized CreateResult resubmit(long id, ApplicationRequest request) {
        ValidatedInput input = validate(request);
        int applicationIndex = -1;
        ActivityApplication current = null;
        for (int index = 0; index < applications.size(); index++) {
            if (applications.get(index).id() == id) {
                applicationIndex = index;
                current = applications.get(index);
                break;
            }
        }

        if (current == null) {
            return new CreateResult(false, "找不到指定的申請紀錄。", null);
        }
        if (!"待補件".equals(current.status())) {
            throw new IllegalArgumentException("只有待補件申請可以修改後重新送出。");
        }

        ActivityApplication conflict = findConflict(input, id);
        if (conflict != null) {
            String message = "場地衝突：%s 在 %s %s–%s 已有申請，系統禁止送出。"
                    .formatted(
                            conflict.venue(),
                            conflict.date(),
                            conflict.startTime(),
                            conflict.endTime()
                    );
            return new CreateResult(false, message, conflict);
        }

        ActivityApplication updated = new ActivityApplication(
                current.id(),
                input.activityName(),
                input.date(),
                input.startTime(),
                input.endTime(),
                input.venue(),
                input.description(),
                "待審核",
                "",
                current.revision() + 1
        );
        applications.set(applicationIndex, updated);
        return new CreateResult(
                true,
                "補件資料已重新送出，申請狀態更新為「待審核」。",
                updated
        );
    }

    private ActivityApplication findConflict(ValidatedInput input, long excludedId) {
        return applications.stream()
                .filter(item -> item.id() != excludedId)
                .filter(item -> !"已退回".equals(item.status()))
                .filter(item -> item.venue().equalsIgnoreCase(input.venue()))
                .filter(item -> item.date().equals(input.date()))
                .filter(item ->
                        input.startTime().isBefore(item.endTime())
                                && input.endTime().isAfter(item.startTime()))
                .findFirst()
                .orElse(null);
    }

    private static ValidatedInput validate(ApplicationRequest request) {
        validateRequired(request);

        LocalDate date;
        LocalTime startTime;
        LocalTime endTime;
        try {
            date = LocalDate.parse(request.date());
            startTime = LocalTime.parse(request.startTime());
            endTime = LocalTime.parse(request.endTime());
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("日期或時間格式不正確。");
        }

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("結束時間必須晚於開始時間。");
        }

        return new ValidatedInput(
                request.activityName().trim(),
                date,
                startTime,
                endTime,
                request.venue().trim(),
                request.description() == null ? "" : request.description().trim()
        );
    }

    private static void validateRequired(ApplicationRequest request) {
        if (isBlank(request.activityName())
                || isBlank(request.date())
                || isBlank(request.startTime())
                || isBlank(request.endTime())
                || isBlank(request.venue())) {
            throw new IllegalArgumentException(
                    "活動名稱、日期、開始時間、結束時間與場地皆需填寫。"
            );
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}

record ValidatedInput(
        String activityName,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String venue,
        String description
) {
}

final class Json {
    private static final Pattern STRING_FIELD = Pattern.compile(
            "\"([^\"]+)\"\\s*:\\s*\"((?:\\\\.|[^\"])*)\""
    );

    private Json() {
    }

    static ApplicationRequest readRequest(String body) {
        Map<String, String> fields = readFields(body);

        if (fields.isEmpty()) {
            throw new IllegalArgumentException("請提供 JSON 格式的申請資料。");
        }

        return new ApplicationRequest(
                fields.get("activityName"),
                fields.get("date"),
                fields.get("startTime"),
                fields.get("endTime"),
                fields.get("venue"),
                fields.getOrDefault("description", "")
        );
    }

    static String writeApplications(List<ActivityApplication> applications) {
        return applications.stream()
                .map(Json::writeApplication)
                .reduce((left, right) -> left + "," + right)
                .map(content -> "[" + content + "]")
                .orElse("[]");
    }

    static String writeResult(CreateResult result) {
        String application = result.application() == null
                ? "null"
                : writeApplication(result.application());
        return """
                {"created":%s,"message":"%s","application":%s}
                """.formatted(
                result.created(),
                escape(result.message()),
                application
        ).trim();
    }

    static Map<String, String> readFields(String body) {
        Map<String, String> fields = new LinkedHashMap<>();
        Matcher matcher = STRING_FIELD.matcher(body);
        while (matcher.find()) {
            fields.put(matcher.group(1), unescape(matcher.group(2)));
        }
        return fields;
    }

    static String writeUpdatedApplication(ActivityApplication application) {
        return "{\"application\":" + writeApplication(application) + "}";
    }

    static String writeError(String message) {
        return "{\"error\":\"" + escape(message) + "\"}";
    }

    private static String writeApplication(ActivityApplication application) {
        return """
                {"id":%d,"activityName":"%s","date":"%s","startTime":"%s","endTime":"%s","venue":"%s","description":"%s","status":"%s","reviewNote":"%s","revision":%d}
                """.formatted(
                application.id(),
                escape(application.activityName()),
                application.date(),
                application.startTime(),
                application.endTime(),
                escape(application.venue()),
                escape(application.description()),
                escape(application.status()),
                escape(application.reviewNote()),
                application.revision()
        ).trim();
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static String unescape(String value) {
        return value
                .replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t")
                .replace("\\\"", "\"")
                .replace("\\\\", "\\");
    }
}
