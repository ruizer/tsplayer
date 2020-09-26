export function formatTime(num: number): string {
  num = Math.round(num);
  let min = Math.floor(num / 60);
  let sec = num % 60;
  return setZero(min) + ':' + setZero(sec);
}

export function setZero(num: number): string {
  if (num < 10) {
    return '0' + num;
  } else {
    return '' + num;
  }
}
