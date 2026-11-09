import { UsersService } from "./users.service";
import { UserUpdateSchema } from "@vigilart/shared";

// Mobile builds installed before the notification settings were split (#360)
// still send `notificationsEnabled`. It must keep working for one release
// (#365): mapped to mobileNotificationsEnabled, never to another device.
describe("legacy notificationsEnabled key", () => {
  const user = { id: "u1", email: "a@b.c" };
  let update: jest.Mock;
  let service: UsersService;

  beforeEach(() => {
    update = jest.fn().mockResolvedValue(user);
    const prisma = { user: { update } } as any;
    const cache = { get: jest.fn().mockResolvedValue(user), set: jest.fn(), del: jest.fn() } as any;
    service = new UsersService(prisma, cache, {} as any);
    jest.spyOn(service, "findOneWithoutPassword").mockResolvedValue(user as any);
  });

  it("is accepted by the update schema", () => {
    expect(UserUpdateSchema.parse({ notificationsEnabled: true })).toEqual({ notificationsEnabled: true });
  });

  it("turns mobile push on from the old key", async () => {
    await service.update("u1", UserUpdateSchema.parse({ notificationsEnabled: true }));
    expect(update.mock.calls[0][0].data).toEqual({ mobileNotificationsEnabled: true });
  });

  it("never overrides the new key", async () => {
    await service.update("u1", UserUpdateSchema.parse({ notificationsEnabled: true, mobileNotificationsEnabled: false }));
    expect(update.mock.calls[0][0].data).toEqual({ mobileNotificationsEnabled: false });
  });

  it("leaves other updates untouched", async () => {
    await service.update("u1", UserUpdateSchema.parse({ firstName: "Amélie" }));
    expect(update.mock.calls[0][0].data).toEqual({ firstName: "Amélie" });
  });
});
