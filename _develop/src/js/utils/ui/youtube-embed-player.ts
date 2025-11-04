/*
  youtube埋め込み再生iOS自動再生対応版

  # pug
  .youtube-player(data-id="YOUTUBE_VIDEO_ID", autoplay, loop)

  自動再生等しない時はattributeを削る
  .youtube-player(data-id="YOUTUBE_VIDEO_ID")

  # CSS
  .youtube-player {
    width: 640px;
    iframe {
      width:100%;
      height:auto;
      aspect-ratio: 16 / 9;
    }
  }
*/

import Util from '../util';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady(): void;
  }
}

export default class YoutubeEmbedPlayer {
  public static PLAYER_COUNT: number = 0;
  constructor() {
    this.setScript();
  }

  private setScript = (): void => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag: HTMLElement | null = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        this.createPlayer();
      };
    }
  };

  private createPlayer = (): void => {
    const youtubeElements: HTMLElement[] = Array.prototype.slice.call(document.getElementsByClassName('youtube-player'));
    for (const elem of youtubeElements) {
      new YoutubeElem(elem);
    }
  };
}

class YoutubeElem {
  private node: HTMLElement | null = null;
  private playerNode: HTMLDivElement = document.createElement('div');
  private isAutoPlay: boolean = false;
  private isLoop: boolean = false;
  private ytPlayer: any;

  constructor(node: HTMLElement) {
    this.node = node;

    this.isAutoPlay = this.node.getAttribute('autoplay') !== null;
    this.isLoop = this.node.getAttribute('loop') !== null;
    this.createPlayer();
  }

  private createPlayer = (): void => {
    if (!this.node) return;
    if (!this.node.dataset.id) {
      Util.warn('youtube-player.ts : YoutubeID not Found');
      return;
    }

    this.node.appendChild(this.playerNode);

    this.ytPlayer = new window.YT.Player(this.playerNode, {
      videoId: this.node.dataset.id,
      playerVars: {
        controls: 1,
        autoplay: this.isAutoPlay,
        disablekb: 1,
        enablejsapi: 1,
        iv_load_policy: 3,
        playsinline: 1,
        rel: 0,
        autohide: 0,
      },
      events: {
        onReady: this.onPlayerReady,
        onStateChange: this.onPlayerStateChange,
      },
    });
  };

  private onPlayerReady = (event: any) => {
    if (!this.isAutoPlay) return;
    event.target.mute();
    event.target.playVideo();
  };

  private onPlayerStateChange = (event: any) => {
    const ytStatus = event.target.getPlayerState();
    if (ytStatus === window.YT.PlayerState.ENDED) {
      if (!this.isLoop) return;
      this.ytPlayer.mute();
      this.ytPlayer.playVideo();
    }
  };
}
