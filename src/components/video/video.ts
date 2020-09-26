let styles = require('./video.css');

import { IVideo, Icomponent } from './interface';
import { formatTime } from '../../util/tool';

function video(options: IVideo) {
  return new Video(options);
}

class Video implements Icomponent {
  tempContainer: HTMLElement;
  videoContent: HTMLVideoElement;
  videoControls: HTMLElement;
  videoPlay: HTMLElement;
  videoFull: HTMLElement;
  videoProgress: NodeListOf<HTMLElement>;
  videoVolProgress: NodeListOf<HTMLElement>;
  videoTimes: NodeListOf<HTMLElement>;
  timer: number;
  canplay: Boolean = false;
  constructor(private settings: IVideo) {
    this.settings = Object.assign(
      {
        width: '100%',
        height: '100%',
        autoplay: false,
      },
      settings,
    );
    this.init();
  }
  init() {
    this.template();
    this.handle();
  }
  template() {
    this.tempContainer = document.createElement('div');
    this.tempContainer.className = styles.video;
    this.tempContainer.style.width = this.settings.width;
    this.tempContainer.style.height = this.settings.height;
    this.tempContainer.innerHTML = `
      <video class="${styles['video-content']}" src="${this.settings.url}"></video>
      <i class="iconfont iconicon_jiazai ${styles['video-loading']}"></i>
      <div class="${styles['video-controls']}">
        <div class="${styles['video-progress']}">
          <div class="${styles['video-progress-now']}"></div>
          <div class="${styles['video-progress-suc']}"></div>
          <div class="${styles['video-progress-bar']}"></div>
        </div>
        <div class="${styles['video-play']}">
          <i class="iconfont iconbofang"></i>
        </div>
        <div class="${styles['video-time']}">
          <span>00:00</span> / <span>00:00</span>
        </div>
        <div class="${styles['video-full']}">
          <i class="iconfont iconquanpingzuidahua"></i>
        </div>
        <div class="${styles['video-volume']}">
          <i class="iconfont iconyinliang"></i>
          <div class="${styles['video-volprogress']}">
            <div class="${styles['video-volprogress-now']}"></div>
            <div class="${styles['video-volprogress-bar']}"></div>
          </div>
        </div>
      </div>
    `;
    if (typeof this.settings.elem === 'object') {
      this.settings.elem.appendChild(this.tempContainer);
    } else {
      document
        .querySelector(`.${this.settings.elem}`)
        .appendChild(this.tempContainer);
    }
  }
  handle() {
    this.videoContent = this.tempContainer.querySelector(
      `.${styles['video-content']}`,
    );
    this.videoControls = this.tempContainer.querySelector(
      `.${styles['video-controls']}`,
    );
    this.videoPlay = this.tempContainer.querySelector(
      `.${styles['video-controls']} i`,
    );
    this.videoFull = this.tempContainer.querySelector(
      `.${styles['video-full']} i`,
    );
    this.videoProgress = this.tempContainer.querySelectorAll(
      `.${styles['video-progress']} div`,
    );
    this.videoVolProgress = this.tempContainer.querySelectorAll(
      `.${styles['video-volprogress']} div`,
    );
    this.videoTimes = this.tempContainer.querySelectorAll(
      `.${styles['video-time']} span`,
    );
    this.canplay = false;

    this.videoContent.volume = 0.5;
    if (this.settings.autoplay) {
      this.timer = window.setInterval(this.playing, 1000);
      this.videoContent.play();
    }

    this.tempContainer.addEventListener('mouseenter', () => {
      this.videoControls.style.bottom = '0';
    });
    this.tempContainer.addEventListener('mouseleave', () => {
      this.videoControls.style.bottom = '-50px';
    });

    // 视频开始加载事件
    this.videoContent.addEventListener('loadstart', () => {
      this.loadingFinish(false);
    });

    // 视频是否加载完毕
    this.videoContent.addEventListener('canplay', () => {
      this.videoTimes[1].innerHTML = formatTime(this.videoContent.duration);
      this.canplay = true;
      this.loadingFinish(true);
    });
    // 视频播放事件
    this.videoContent.addEventListener('play', () => {
      this.videoPlay.className = 'iconfont iconzantingtingzhi';
      this.timer = window.setInterval(this.playing, 1000);
    });
    // 视频暂停事件
    this.videoContent.addEventListener('pause', () => {
      this.videoPlay.className = 'iconfont iconbofang';
      window.clearInterval(Number(this.timer));
    });

    //点击屏幕播放暂停
    this.videoContent.addEventListener('click', () => {
      this.playAndPause();
    });

    //播放暂停
    this.videoPlay.addEventListener('click', () => {
      this.playAndPause();
    });
    // 全屏
    this.videoFull.addEventListener('click', () => {
      this.videoContent.requestFullscreen();
    });

    // 拖拽视频进度图标
    this.dragProgress(
      this.videoProgress[2],
      (scale: number) => {
        this.videoProgress[0].style.width = scale * 100 + '%';
        this.videoProgress[1].style.width = scale * 100 + '%';
        this.videoContent.currentTime = scale * this.videoContent.duration;
        this.videoTimes[0].innerHTML = formatTime(
          this.videoContent.currentTime,
        );
      },
      () => {
        this.loadingFinish(false);
      },
    );

    // 拖拽音量进度图标
    this.dragProgress(this.videoVolProgress[1], (scale: number) => {
      this.videoVolProgress[0].style.width = scale * 100 + '%';
      this.videoContent.volume = scale;
    });
  }
  // 是否加载完成，图标是否隐藏
  loadingFinish(bool: Boolean) {
    let videoLoading: HTMLElement = this.tempContainer.querySelector(
      `.${styles['video-loading']}`,
    );
    videoLoading.style.display = bool ? 'none' : 'inline-block';
  }
  // 播放
  playing() {
    if (!this.canplay) return;
    let scale = this.videoContent.currentTime / this.videoContent.duration;
    let scaleSuc =
      this.videoContent.buffered.end(0) / this.videoContent.duration;
    this.videoTimes[0].innerHTML = formatTime(this.videoContent.currentTime);
    this.videoProgress[0].style.width = scale * 100 + '%';
    this.videoProgress[1].style.width = scaleSuc * 100 + '%';
    this.videoProgress[2].style.left = scale * 100 + '%';
  }
  // 拖拽条
  dragProgress(
    elem: HTMLElement,
    callback: (value: number) => void,
    mouseupback?,
  ) {
    elem.addEventListener('mousedown', (ev: MouseEvent) => {
      if (!this.canplay) return;
      let downX = ev.pageX;
      let downL = elem.offsetLeft;
      document.onmousemove = (ev: MouseEvent) => {
        let scale =
          (ev.pageX - downX + downL + 8) / elem.parentElement.offsetWidth;
        scale < 0 && (scale = 0);
        scale > 1 && (scale = 1);
        elem.style.left = scale * 100 + '%';
        callback(scale);
      };
      document.onmouseup = () => {
        document.onmousemove = document.onmouseup = null;
        mouseupback();
      };
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
}

export default video;
