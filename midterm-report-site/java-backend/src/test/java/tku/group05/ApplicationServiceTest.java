package tku.group05;

public final class ApplicationServiceTest {
    private ApplicationServiceTest() {
    }

    public static void main(String[] args) {
        ApplicationService service = new ApplicationService();

        CreateResult first = service.create(request(
                "社團活動",
                "2026-07-26",
                "10:00",
                "12:00",
                "活動中心"
        ));
        check(first.created(), "完整資料應建立成功");
        check("待審核".equals(first.application().status()), "新申請狀態應為待審核");
        ActivityApplication approved = service
                .updateStatus(first.application().id(), "已核准", "")
                .orElseThrow();
        check("已核准".equals(approved.status()), "課外活動組應能核准申請");

        CreateResult differentVenue = service.create(request(
                "另一場活動",
                "2026-07-26",
                "10:30",
                "11:30",
                "另一場地"
        ));
        check(differentVenue.created(), "相同時間、不同場地應允許送出");

        CreateResult conflict = service.create(request(
                "衝突活動",
                "2026-07-26",
                "11:00",
                "13:00",
                "活動中心"
        ));
        check(!conflict.created(), "同場地重疊時段應禁止送出");
        check(service.findAll().size() == 2, "衝突資料不應新增");

        ActivityApplication returned = service
                .updateStatus(
                        differentVenue.application().id(),
                        "待補件",
                        "請補充活動說明"
                )
                .orElseThrow();
        check("待補件".equals(returned.status()), "課外活動組應能要求補件");
        check(
                "請補充活動說明".equals(returned.reviewNote()),
                "待補件應保留原因"
        );

        CreateResult resubmitted = service.resubmit(
                returned.id(),
                new ApplicationRequest(
                        returned.activityName(),
                        returned.date().toString(),
                        returned.startTime().toString(),
                        returned.endTime().toString(),
                        returned.venue(),
                        "已補充活動說明"
                )
        );
        check(resubmitted.created(), "待補件申請應能修改後重新送出");
        check(
                resubmitted.application().revision() == 2,
                "重新送出後版本應增加"
        );

        ActivityApplication rejected = service
                .updateStatus(
                        returned.id(),
                        "已退回",
                        "活動資料仍不完整"
                )
                .orElseThrow();
        check("已退回".equals(rejected.status()), "課外活動組應能退回申請");

        try {
            service.create(request("", "2026-07-26", "14:00", "15:00", "活動中心"));
            throw new AssertionError("缺少活動名稱應驗證失敗");
        } catch (IllegalArgumentException expected) {
            check(expected.getMessage().contains("皆需填寫"), "應回傳必填欄位訊息");
        }

        System.out.println("ApplicationServiceTest: all scenarios passed");
    }

    private static ApplicationRequest request(
            String activityName,
            String date,
            String startTime,
            String endTime,
            String venue
    ) {
        return new ApplicationRequest(
                activityName,
                date,
                startTime,
                endTime,
                venue,
                ""
        );
    }

    private static void check(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
