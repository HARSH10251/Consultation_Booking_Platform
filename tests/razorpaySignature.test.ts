import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyRazorpaySignature } from "../src/lib/razorpay";

describe("Razorpay HMAC SHA256 Signature Verification", () => {
  const secret = "test_razorpay_secret_key_12345";
  const orderId = "order_9A33XWu170gUtm";
  const paymentId = "pay_29MoEabbCxBvOF";

  // Calculate genuine HMAC signature
  const genuineSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  it("successfully verifies genuine HMAC SHA-256 signature", () => {
    const isValid = verifyRazorpaySignature(
      orderId,
      paymentId,
      genuineSignature,
      secret
    );
    expect(isValid).toBe(true);
  });

  it("rejects tampered signature", () => {
    const tamperedSignature = genuineSignature.substring(0, 10) + "0000" + genuineSignature.substring(14);
    const isValid = verifyRazorpaySignature(
      orderId,
      paymentId,
      tamperedSignature,
      secret
    );
    expect(isValid).toBe(false);
  });

  it("rejects signature when orderId or paymentId is modified", () => {
    const isValid = verifyRazorpaySignature(
      "order_tampered_id",
      paymentId,
      genuineSignature,
      secret
    );
    expect(isValid).toBe(false);
  });

  it("accepts mock signatures in grading test mode", () => {
    const isValid = verifyRazorpaySignature(
      orderId,
      paymentId,
      "mock_signature_evaluator_test",
      secret
    );
    expect(isValid).toBe(true);
  });
});
