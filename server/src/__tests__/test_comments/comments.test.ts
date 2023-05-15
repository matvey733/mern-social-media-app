import dotenv from "dotenv";
dotenv.config();
import { HydratedDocument } from "mongoose"
import User, { IUser } from "../../models/User"
import createNUsers from "../utils/createNUsers";
import requests from "supertest";
import app from "../../app";
import getAuthHeadersForUsers from "../utils/getAuthHeadersForUsers";
import { MongoMemoryServer } from "mongodb-memory-server";
import { dbConnSetup, dbConnTeardown } from "../utils/db";
import path from "path";
import getEnvVar from "../../utils/getEnvVar";
import Post, { IPost } from "../../models/Post";
import addComment from "./addComment";

let mongod: MongoMemoryServer;

let user1: HydratedDocument<IUser>;
let user2: HydratedDocument<IUser>;
export let user1AuthHeader: string;
export let user2AuthHeader: string;
export let postByUser1: HydratedDocument<IPost>;

describe("comments", () => {
  describe("add comment", () => {
    describe("not given an auth header", () => {
      it("returns 401 unauthorized", async () => {
        const { statusCode, body } = await requests(app)
          .post(`/posts/${postByUser1.postPath}/comments`)
          .send({ content: "foo" });
        
        expect(statusCode).toBe(401);
        expect(body.message).toMatch(/unauthorized/);
      })
    })

    describe("given user 1 auth header", () => {
      describe("given text content", () => {
        const content = "foo bar";
        it("returns 201 created", async () => {
          const { statusCode, body } = await requests(app)
            .post(`/posts/${postByUser1.postPath}/comments`)
            .send({ content })
            .set("Authorization", user1AuthHeader);

          expect(statusCode).toBe(201);
          expect(body.createdBy).toBe(user1.id);
          expect(body.content).toBe(content);
          expect(body.onPost).toBe(postByUser1.postPath);
          expect([body.likes, body.dislikes]).toEqual([0, 0]);
          expect(body.replyTo).toBe(null);
          expect([body.imgs, body.vids]).toEqual([[], []]);
          expect(body.createdAt).toBeDefined();
          expect(body.updatedAt).toBe(body.createdAt);
        })

        describe("given reply to comment (which exists)", () => {
          it("returns 201 & comment & reply to", async () => {
            // const { body: body1 } = await requests(app).post(`/posts/${postByUser1.postPath}/comments`).send({ content: "foo" })
            const { body: comm1, statusCode: statusCodeComm1 } = await addComment("foo");
            const { body: comm2, statusCode: statusCodeComm2 } = await addComment("bar", comm1._id);

            expect(statusCodeComm1).toBe(201);
            expect(statusCodeComm2).toBe(201);
            expect(comm1.onPost).toBe(postByUser1.postPath);
            expect(comm1.replyTo).toBe(null);
            expect(comm2.onPost).toBe(postByUser1.postPath);
            expect(comm2.replyTo).toBe(comm1._id);
          })
        })
      })
    })
  })

  beforeAll(async () => {
    mongod = await dbConnSetup();
    [user1, user2] = await createNUsers(2);
    [user1AuthHeader, user2AuthHeader] = getAuthHeadersForUsers(user1, user2);
  });
  beforeEach(async () => {
    const { body } = await requests(app)
      .post(`/users/${user1.profilePath}/posts`)
      .send({ content: "hi" })
      .set("Authorization", user1AuthHeader);
    postByUser1 = JSON.parse(JSON.stringify(body));
  });
  afterAll(async () => await dbConnTeardown(mongod));
})
