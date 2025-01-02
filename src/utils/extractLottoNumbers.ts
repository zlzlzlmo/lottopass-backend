export const extractKeyValuesBy = (
  data: Record<string, any>,
  startWith: string
): number[] => {
  return Object.keys(data)
    .filter((key) => key.startsWith(startWith)) // 'drwtNo'로 시작하는 키만 필터링
    .sort((a, b) => a.localeCompare(b)) // 숫자 순서로 정렬
    .map((key) => data[key]); // 키를 통해 값 추출
};
