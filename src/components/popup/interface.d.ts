interface Ipopup {
  width?: string;
  height?: string;
  title?: string;
  position?: string;
  mask?: boolean;
  content?: (content: HTMLElement) => void;
}

interface Icomponent {
  tempContainer: HTMLElement;
  init: () => void;
  template: () => void;
  handle: () => void;
}

export interface module {}
