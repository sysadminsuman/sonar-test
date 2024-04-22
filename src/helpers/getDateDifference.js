//import dayjs from "dayjs";

export const getDateDifference = async (t1, t0) => {
  let d = new Date(t1) - new Date(t0);
  let days = Math.floor(d / 1000 / 60 / 60 / 24);
  let hours = Math.floor(d / 1000 / 60 / 60 - days * 24);
  let minutes = Math.floor(d / 1000 / 60 - days * 24 * 60 - hours * 60);
  let t = {};
  ["days", "hours", "minutes"].forEach((q) => {
    if (eval(q) > 0) {
      t[q] = eval(q);
    }
  });
  return t;
};

export const getDateDifferenceString = async (t1, t0) => {
  let timeDiff = await getDateDifference(t1, t0);
  let difference = "";
  //console.log(timeDiff);
  if (Object.keys(timeDiff).length != 0) {
    if (timeDiff.days > 0) {
      difference += timeDiff.days === 1 ? `${timeDiff.days}일` : `${timeDiff.days}일`;
    } else if (timeDiff.hours > 0) {
      difference +=
        timeDiff.hours === 0 || timeDiff.hours === 1
          ? `${timeDiff.hours}시간`
          : `${timeDiff.hours}시간`;
    } else if (timeDiff.minutes > 0) {
      difference +=
        timeDiff.minutes === 0 || timeDiff.hours === 1
          ? `${timeDiff.minutes}분`
          : `${timeDiff.minutes}분`;
    }
    difference += "전";
  } else {
    difference += "방금전";
  }
  //console.log(difference);
  return difference;
};

export const getDateDifferenceHours = async (dt2, dt1) => {
  let timeDiff = await getDateDifference(dt2, dt1);
  let difference = "";
  //console.log(timeDiff);
  if (Object.keys(timeDiff).length != 0) {
    if (timeDiff.days > 0) {
      difference += timeDiff.days === 1 ? `${timeDiff.days}일` : `${timeDiff.days}일`;
    } else if (timeDiff.hours > 0) {
      difference +=
        timeDiff.hours === 0 || timeDiff.hours === 1
          ? `${timeDiff.hours}시간`
          : `${timeDiff.hours}시간`;
    } else if (timeDiff.minutes > 0) {
      difference +=
        timeDiff.minutes === 0 || timeDiff.hours === 1
          ? `${timeDiff.minutes}분`
          : `${timeDiff.minutes}분`;
    }
  } else {
    difference += "방금전";
  }
  //console.log(difference);
  return difference;
};

/*
console.log(duration('2019-07-17T18:35:25.235Z', '2019-07-20T00:37:28.839Z'));

function duration(t0, t1){
    let d = (new Date(t1)) - (new Date(t0));
    let weekdays     = Math.floor(d/1000/60/60/24/7);
    let days         = Math.floor(d/1000/60/60/24 - weekdays*7);
    let hours        = Math.floor(d/1000/60/60    - weekdays*7*24            - days*24);
    let minutes      = Math.floor(d/1000/60       - weekdays*7*24*60         - days*24*60         - hours*60);
    let seconds      = Math.floor(d/1000          - weekdays*7*24*60*60      - days*24*60*60      - hours*60*60      - minutes*60);
    let milliseconds = Math.floor(d               - weekdays*7*24*60*60*1000 - days*24*60*60*1000 - hours*60*60*1000 - minutes*60*1000 - seconds*1000);
    let t = {};
    ['weekdays', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'].forEach(q=>{ if (eval(q)>0) { t[q] = eval(q); } });
    return t;
}
*/
