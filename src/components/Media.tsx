import { ResolvedMedia } from "~/types/media";

function Media(props: ResolvedMedia) {
  switch (props.type) {
    case "image":
      return <img src={props.url} />;

    case "video":
      return <video loop muted autoPlay src={props.url} />;
  }

  return null;
}

export default Media;
