import { ResolvedMedia } from "~/types";

export interface MediaProps extends ResolvedMedia {
  maxSize?: number;
  minSize?: number;
}

function Media(props: MediaProps) {
  const style = {
    maxHeight: `${props.maxSize}px`,
    maxWidth: `${props.maxSize}px`,

    minHeight: `${props.minSize}px`,
    minWidth: `${props.minSize}px`,
  };

  switch (props.type) {
    case "image":
      return <img style={style} src={props.url} />;

    case "video":
      return <video style={style} src={props.url} loop muted autoPlay />;
  }

  return null;
}

export default Media;
