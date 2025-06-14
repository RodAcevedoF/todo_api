import { hashToken } from "../../../src/utils/hashToken.js";

test("should hash the token using sha256", () => {
  const token = "abc123";
  const hashed = hashToken(token);
  expect(hashed).toBe(
    "6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090"
  );
});
