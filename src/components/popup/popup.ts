// import './popup.css'
let styles = require('./popup.css');
// import styles from './popup.css';
// 这边使用import引入popup.css必须加popup.css.d.ts声明文件

import { Ipopup, Icomponent } from './interface.d';

function popup(options: Ipopup) {
  return new Popup(options);
}

class Popup implements Icomponent {
  tempContainer;
  mask;
  constructor(private settings: Ipopup) {
    this.settings = Object.assign(
      {
        width: '100%',
        height: '100%',
        title: '',
        position: 'center',
        mask: true,
        content: function () {},
      },
      settings,
    );
    this.init();
  }

  // 初始化
  init() {
    this.template();
    this.settings.mask && this.createMask();
    this.handle();
    this.contentCallback();
  }
  //创建模板
  template() {
    this.tempContainer = document.createElement('div');
    this.tempContainer.style.width = this.settings.width;
    this.tempContainer.style.height = this.settings.height;
    this.tempContainer.className = styles.popup;

    this.tempContainer.innerHTML = `
        <div class="${styles['popup-title']}">
          <h3>${this.settings.title}<h3>
          <i class="iconfont iconguanbi"></i>
        </div>
        <div class="${styles['popup-content']}"></div>
      `;
    document.body.appendChild(this.tempContainer);

    if (this.settings.position === 'left') {
      this.tempContainer.style.left = 0;
      this.tempContainer.style.top =
        (window.innerHeight - this.tempContainer.offsetHeight) / 2 + 'px';
    } else if (this.tempContainer.position === 'right') {
      this.tempContainer.style.right = 0;
      this.tempContainer.style.top =
        (window.innerHeight - this.tempContainer.offsetHeight) / 2 + 'px';
    } else {
      this.tempContainer.style.left =
        (window.innerWidth - this.tempContainer.offsetWidth) / 2 + 'px';
      this.tempContainer.style.top =
        (window.innerHeight - this.tempContainer.offsetHeight) / 2 + 'px';
    }
  }
  //事件操作
  handle() {
    let popupClose = this.tempContainer.querySelector(
      `.${styles['popup-title']} i`,
    );
    popupClose.addEventListener('click', () => {
      document.body.removeChild(this.tempContainer);
      this.settings.mask && document.body.removeChild(this.mask);
    });
  }
  // 创建遮罩层
  createMask() {
    this.mask = document.createElement('div');
    this.mask.className = styles.mask;
    this.mask.style.width = '100%';
    this.mask.style.height = document.body.offsetHeight + 'px';
    document.body.appendChild(this.mask);
  }
  // 回调函数
  contentCallback() {
    let poppupContent = this.tempContainer.querySelector(
      `.${styles['popup-content']}`,
    );
    this.settings.content(poppupContent);
  }
}

export default popup;
