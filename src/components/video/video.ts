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
  timer: Number;
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
    const vm = this;

    this.videoContent.volume = 0.5;
    if (this.settings.autoplay) {
      this.timer = window.setInterval(playing, 1000);
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
      this.timer = window.setInterval(playing, 1000);
    });
    // 视频暂停事件
    this.videoContent.addEventListener('pause', () => {
      this.videoPlay.className = 'iconfont iconbofang';
      window.clearInterval(Number(this.timer));
    });

    //播放暂停
    this.videoPlay.addEventListener('click', () => {
      if (this.videoContent.paused) {
        this.videoContent.play();
      } else {
        this.videoContent.pause();
      }
    });
    // 全屏
    this.videoFull.addEventListener('click', () => {
      this.videoContent.requestFullscreen();
    });

    // 拖拽进度图标
    this.videoProgress[2].addEventListener('mousedown', function (
      ev: MouseEvent,
    ) {
      if (!vm.canplay) return;
      let downX = ev.pageX;
      let downL = this.offsetLeft;
      document.onmousemove = (ev: MouseEvent) => {
        let scale =
          (ev.pageX - downX + downL + 8) / this.parentElement.offsetWidth;
        scale < 0 && (scale = 0);
        scale > 1 && (scale = 1);
        vm.videoProgress[0].style.width = scale * 100 + '%';
        vm.videoProgress[1].style.width = scale * 100 + '%';
        this.style.left = scale * 100 + '%';
        vm.videoContent.currentTime = scale * vm.videoContent.duration;
        vm.videoTimes[0].innerHTML = formatTime(vm.videoContent.currentTime);
      };
      document.onmouseup = () => {
        document.onmousemove = document.onmouseup = null;
        vm.loadingFinish(false);
      };
      ev.preventDefault();
    });

    // 拖拽音量进度图标
    this.videoVolProgress[1].addEventListener('mousedown', function (
      ev: MouseEvent,
    ) {
      if (!vm.canplay) return;
      let downX = ev.pageX;
      let downL = this.offsetLeft;
      document.onmousemove = (ev: MouseEvent) => {
        let scale =
          (ev.pageX - downX + downL + 8) / this.parentElement.offsetWidth;
        scale < 0 && (scale = 0);
        scale > 1 && (scale = 1);
        vm.videoVolProgress[0].style.width = scale * 100 + '%';
        this.style.left = scale * 100 + '%';
        vm.videoContent.volume = scale;
      };
      document.onmouseup = () => {
        document.onmousemove = document.onmouseup = null;
      };
      ev.preventDefault();
    });

    // 正在播放中
    function playing() {
      if (!this.canplay) return;
      let scale = this.videoContent.currentTime / this.videoContent.duration;
      let scaleSuc =
        this.videoContent.buffered.end(0) / this.videoContent.duration;
      this.videoTimes[0].innerHTML = formatTime(this.videoContent.currentTime);
      this.videoProgress[0].style.width = scale * 100 + '%';
      this.videoProgress[1].style.width = scaleSuc * 100 + '%';
      this.videoProgress[2].style.left = scale * 100 + '%';
    }
  }
  // 是否加载完成，图标是否隐藏
  loadingFinish(bool: Boolean) {
    let videoLoading: HTMLElement = this.tempContainer.querySelector(
      `.${styles['video-loading']}`,
    );
    videoLoading.style.display = bool ? 'none' : 'inline-block';
  }
}

export default video;
