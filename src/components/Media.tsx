/* eslint-disable @next/next/no-img-element */

import type { FC } from "react";

import PropTypes from "prop-types";

import { ResolvedMedia } from "@/types/media";

const Media: FC<ResolvedMedia> = (props) => {
  switch (props.type) {
    case "image":
      return <img alt={props.url} src={props.url} />;

    case "video":
      return <video loop muted autoPlay src={props.url} />;
  }

  return null;
};

Media.propTypes = {
  type: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default Media;
