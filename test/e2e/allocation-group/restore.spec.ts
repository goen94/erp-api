import request from "supertest";
import UserFactory from "../utils/factory/user.factory.js";
import { createApp } from "@src/app.js";
import { db } from "@src/database/database.js";

describe("restore allocationGroup", () => {
  let _id = "";
  beforeEach(async () => {
    // delete allocation group
    await db.collection("allocationGroups").deleteAll();

    // create user
    await new UserFactory(db).createUsers();

    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin2024",
    });
    const accessToken = authResponse.body.accessToken;
    // send request to create allocationGroup
    const data = {
      name: "allocationGroup A",
    };
    const response = await request(app)
      .post("/v1/allocation-groups")
      .send(data)
      .set("Authorization", `Bearer ${accessToken}`);
    _id = response.body._id;
  });
  it("should check user is authorized", async () => {
    const app = await createApp();
    // send request to create allocationGroup
    const response = await request(app).patch("/v1/allocation-groups/" + _id + "/restore");
    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toBe("Authentication credentials is invalid.");
  });
  // TO DO : wait until permission fixed
  // it("should check user have permission to access", async () => {
  //   const app = await createApp();
  //   // get access token for authorization request
  //   const authResponse = await request(app).post("/v1/auth/signin").send({
  //     username: "user",
  //     password: "user2024",
  //   });
  //   const accessToken = authResponse.body.accessToken;
  //   // send request to read allocationGroup
  //   const response = await request(app)
  //     .patch("/v1/allocation-groups/" + _id + "/restore")
  //     .set("Authorization", `Bearer ${accessToken}`);

  //   expect(response.statusCode).toEqual(403);
  //   expect(response.body.message).toBe("Don't have necessary permissions for this resource.");
  // });
  it("should delete data from database", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin2024",
    });
    const accessToken = authResponse.body.accessToken;
    const responseDelete = await request(app)
      .patch("/v1/allocation-groups/" + _id + "/restore")
      .set("Authorization", `Bearer ${accessToken}`);
    // expected response status
    expect(responseDelete.statusCode).toEqual(204);

    const response = await request(app)
      .get("/v1/allocation-groups/" + _id)
      .set("Authorization", `Bearer ${accessToken}`);
    // expected response status
    expect(response.statusCode).toEqual(200);
    // expected response body
    expect(response.body.data.isArchived).toBe(false);
  });
});
