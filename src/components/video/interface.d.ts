interface IVideo {
  url: string;
  elem: string | HTMLElement;
  width?: string;
  height?: string;
  autoplay?: boolean;
}


interface Icomponent {
  tempContainer: HTMLElement;
  init: () => void;
  template: () => void;
  handle: () => void;
}

export interface module {}
