export default class OTP {
  public code: number;
  public expired_at: number;

  constructor(code: number, expired_at: number) {
    this.code = code;
    this.expired_at = expired_at;
  }
}