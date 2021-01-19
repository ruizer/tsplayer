let styles = require("./video.css");

import { IVideo, Icomponent } from "./interface";
import { formatTime } from "../../util/tool";

function video(options: IVideo) {
  return new Video(options);
}

const TIMES = [4, 3.5, 3, 2.5, 2, 1.75, 1.25, 1, 0.75, 0.5];

class Video implements Icomponent {
  tempContainer: HTMLElement;
  videoContent: HTMLVideoElement;
  videoControls: HTMLElement;
  videoPlay: HTMLElement;
  videoFull: HTMLElement;
  videoProgress: HTMLElement;
  videoProgressTools: NodeListOf<HTMLElement>;
  videoVolProgress: HTMLElement;
  videoVolProgressTools: NodeListOf<HTMLElement>;
  videoTimes: NodeListOf<HTMLElement>;
  notification: HTMLElement;
  playbackRateEl: HTMLElement;
  playbackRateSpanEl: HTMLElement;
  playbackRateULEl: HTMLElement;
  timer: number;
  canplay: Boolean = false;
  constructor(private settings: IVideo) {
    this.settings = Object.assign(
      {
        width: "100%",
        height: "100%",
        autoplay: false,
        times: 1,
      },
      settings
    );
    if (!TIMES.includes(this.settings.times)) {
      // 播放倍数参数错误，置为1
      this.settings.times = 1;
    }
    this.init();
  }
  init() {
    this.template();
    this.handle();
  }
  template() {
    this.tempContainer = document.createElement("div");
    this.tempContainer.className = styles.video;
    this.tempContainer.style.width = this.settings.width;
    this.tempContainer.style.height = this.settings.height;
    const posterHtml = this.settings.poster
      ? `poster="${this.settings.poster}"`
      : "";
    const rateHtml = TIMES.map((n) => `<li data-rate="${n}">${n}x</li>`).join(
      ""
    );
    this.tempContainer.innerHTML = `
      <video class="${styles["video-content"]}" ${posterHtml} src="${this.settings.url}"></video>
      <i class="iconfont iconxingzhuang ${styles["video-loading"]}"></i>
      <div class="${styles["video-controls"]}">
        <div class="${styles["video-progress"]}">
          <div class="${styles["video-progress-now"]}"></div>
          <div class="${styles["video-progress-suc"]}"></div>
          <div class="${styles["video-progress-bar"]}"></div>
        </div>
        <div class="${styles["video-play"]}">
          <i class="iconfont iconbofang"></i>
        </div>
        <div class="${styles["video-time"]}">
          <span>00:00</span> / <span>00:00</span>
        </div>
        <div class="${styles["video-full"]}">
          <i class="iconfont iconquanpingzuidahua"></i>
        </div>
        <div class="${styles["video-volume"]}">
          <i class="iconfont iconnotificationfill"></i>
          <div class="${styles["video-volprogress"]}">
            <div class="${styles["video-volprogress-now"]}"></div>
            <div class="${styles["video-volprogress-bar"]}"></div>
          </div>
        </div>
        <div class="${styles["video-rate"]}">
          <span>倍数</span>
          <ul>${rateHtml}</ul>
        </div>
      </div>
    `;
    if (typeof this.settings.elem === "object") {
      this.settings.elem.appendChild(this.tempContainer);
    } else {
      document
        .querySelector(`.${this.settings.elem}`)
        .appendChild(this.tempContainer);
    }
  }
  handle() {
    this.videoContent = this.tempContainer.querySelector(
      `.${styles["video-content"]}`
    );
    this.videoControls = this.tempContainer.querySelector(
      `.${styles["video-controls"]}`
    );
    this.videoPlay = this.tempContainer.querySelector(
      `.${styles["video-controls"]} i`
    );
    this.videoFull = this.tempContainer.querySelector(
      `.${styles["video-full"]} i`
    );
    this.videoProgress = this.tempContainer.querySelector(
      `.${styles["video-progress"]}`
    );
    this.videoProgressTools = this.tempContainer.querySelectorAll(
      `.${styles["video-progress"]} div`
    );
    this.videoVolProgress = this.tempContainer.querySelector(
      `.${styles["video-volprogress"]}`
    );
    this.videoVolProgressTools = this.tempContainer.querySelectorAll(
      `.${styles["video-volprogress"]} div`
    );
    this.videoTimes = this.tempContainer.querySelectorAll(
      `.${styles["video-time"]} span`
    );
    this.notification = this.tempContainer.querySelector(
      `.${styles["video-volume"]} i`
    );
    this.playbackRateEl = this.tempContainer.querySelector(
      `.${styles["video-rate"]}`
    );
    this.playbackRateSpanEl = this.tempContainer.querySelector(
      `.${styles["video-rate"]} span`
    );
    this.playbackRateULEl = this.tempContainer.querySelector(
      `.${styles["video-rate"]} ul`
    );
    this.canplay = false;

    this.videoContent.volume = 0.5;
    this.videoContent.playbackRate = this.settings.times;
    if (this.settings.autoplay) {
      this.timer = window.setInterval(this.playing.bind(this), 1000);
      this.videoContent.play();
    }

    this.tempContainer.addEventListener("mouseenter", () => {
      this.videoControls.style.bottom = "0";
    });
    this.tempContainer.addEventListener("mouseleave", () => {
      this.videoControls.style.bottom = "-50px";
    });

    // 视频开始加载事件
    this.videoContent.addEventListener("loadstart", () => {
      this.loadingFinish(false);
    });

    // 视频是否加载完毕
    this.videoContent.addEventListener("canplay", () => {
      this.videoTimes[1].innerHTML = formatTime(this.videoContent.duration);
      this.canplay = true;
      this.loadingFinish(true);
    });
    // 视频播放事件
    this.videoContent.addEventListener("play", () => {
      this.videoPlay.className = "iconfont iconzantingtingzhi";
      this.timer = window.setInterval(this.playing.bind(this), 1000);
    });
    // 视频暂停事件
    this.videoContent.addEventListener("pause", () => {
      this.videoPlay.className = "iconfont iconbofang";
      window.clearInterval(Number(this.timer));
    });

    //点击屏幕播放暂停
    this.videoContent.addEventListener("click", () => {
      this.playAndPause();
    });

    //播放暂停
    this.videoPlay.addEventListener("click", () => {
      this.playAndPause();
    });
    // 全屏
    this.videoFull.addEventListener("click", () => {
      this.videoContent.requestFullscreen();
    });

    // 点击进度条或拖拽进度条图标
    this.clickDragProgress();

    // 点击音量进度条或拖拽音量进度图标
    this.clickDragVolProgress();

    // 倍数
    this.rateTitle(this.settings.times);
    // 倍数选项
    this.rateShowOption(false);
    // 倍数点击事件，及选项点击事件
    this.rateClick();
  }
  // 是否加载完成，图标是否隐藏
  loadingFinish(bool: Boolean) {
    let videoLoading: HTMLElement = this.tempContainer.querySelector(
      `.${styles["video-loading"]}`
    );
    videoLoading.style.display = bool ? "none" : "inline-block";
  }
  // 播放
  playing() {
    if (!this.canplay) return;
    let scale = this.videoContent.currentTime / this.videoContent.duration;
    let scaleSuc =
      this.videoContent.buffered.end(0) / this.videoContent.duration;
    this.videoTimes[0].innerHTML = formatTime(this.videoContent.currentTime);
    this.videoProgressTools[0].style.width = scale * 100 + "%";
    this.videoProgressTools[1].style.width = scaleSuc * 100 + "%";
    this.videoProgressTools[2].style.left = scale * 100 + "%";
  }
  // 点击进度条或拖拽进度条图标
  clickDragProgress() {
    this.clickProgress(this.videoProgress, (scale: number) => {
      callback(scale);
      this.loadingFinish(false);
    });
    this.dragProgress(
      this.videoProgressTools[2],
      (scale: number) => {
        callback(scale);
      },
      () => {
        this.loadingFinish(false);
      }
    );
    const vm = this;
    function callback(scale: number) {
      vm.videoProgressTools[0].style.width = scale * 100 + "%";
      vm.videoProgressTools[1].style.width = scale * 100 + "%";
      vm.videoProgressTools[2].style.left = scale * 100 + "%";
      vm.videoContent.currentTime = scale * vm.videoContent.duration;
      vm.videoTimes[0].innerHTML = formatTime(vm.videoContent.currentTime);
    }
  }
  // 点击音量进度条或拖拽音量进度条图标
  clickDragVolProgress() {
    this.clickProgress(this.videoVolProgress, (scale: number) => {
      callback(scale);
    });
    this.dragProgress(this.videoVolProgressTools[1], (scale: number) => {
      callback(scale);
    });
    const vm = this;
    function callback(scale: number) {
      vm.videoVolProgressTools[0].style.width = scale * 100 + "%";
      vm.videoVolProgressTools[1].style.left = scale * 100 + "%";
      vm.videoContent.volume = scale;
      vm.notificationLow(scale <= 0);
    }
  }
  // 拖拽进度条
  dragProgress(
    elem: HTMLElement,
    callback: (value: number) => void,
    mouseupback?: () => void
  ) {
    elem.addEventListener("mousedown", (ev: MouseEvent) => {
      if (!this.canplay) return;
      let downX = ev.pageX;
      let downL = elem.offsetLeft;
      document.onmousemove = (evd: MouseEvent) => {
        let scale =
          (evd.pageX - downX + downL + 8) / elem.parentElement.offsetWidth;
        scale < 0 && (scale = 0);
        scale > 1 && (scale = 1);
        callback(scale);
      };
      document.onmouseup = () => {
        document.onmousemove = document.onmouseup = null;
        mouseupback && mouseupback();
      };
      ev.preventDefault();
    });
  }
  // 点击进度条
  clickProgress(elem: HTMLElement, callback: (value: number) => void) {
    elem.addEventListener("click", (ev: MouseEvent) => {
      if (!this.canplay) return;
      let scale =
        (ev.pageX - elem.getBoundingClientRect().left) / elem.offsetWidth;
      scale < 0 && (scale = 0);
      scale > 1 && (scale = 1);
      callback(scale);
      ev.preventDefault();
    });
  }
  // 播放暂停
  playAndPause() {
    if (this.videoContent.paused) {
      this.videoContent.play();
    } else {
      this.videoContent.pause();
    }
  }
  // 音量图标
  notificationLow(bool) {
    this.notification.className = bool
      ? "iconfont iconnotificationforbidfill"
      : "iconfont iconnotificationfill";
  }
  // 更改倍数
  rateTitle(num) {
    this.playbackRateSpanEl.innerText = `倍数 ${num}x`;
  }
  // 倍数选项
  rateShowOption(bool) {
    this.playbackRateULEl.style.display = bool ? "block" : "none";
  }
  // 倍数点击事件及选项点击事件
  rateClick() {
    this.playbackRateSpanEl.addEventListener("click", () => {
      this.rateShowOption(true);
    });
    this.playbackRateULEl.addEventListener("click", (e: Event) => {
      if (!this.canplay) return;
      const target = e.target as any;
      const dataset = target.dataset;
      if (!(dataset && dataset.rate)) {
        return;
      }
      const oldRate = this.videoContent.playbackRate;
      const rate = Number(dataset.rate);
      if (TIMES.includes(rate) && rate !== oldRate) {
        this.videoContent.playbackRate = rate;
        this.rateShowOption(false);
        this.rateTitle(rate);
      }
    });
  }
}

export default video;
