export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message; // Error 객체의 메시지 반환
  }
  return 'An unexpected error occurred'; // 기본 메시지
}
