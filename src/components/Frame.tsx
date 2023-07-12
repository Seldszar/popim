import { styled } from "goober";
import { gsap } from "gsap";
import { includes, random } from "lodash";
import { Pangolin } from "next/font/google";
import { forwardRef, useLayoutEffect, useRef } from "react";

import { ResolvedMedia, Settings } from "~/types";

import Logo from "./Logo";
import Media from "./Media";

const pangolin = Pangolin({
  subsets: ["latin"],
  weight: ["400"],
});

const Watermark = styled(Logo)`
  color: #dddddd;
  height: 22px;
`;

const Curator = styled("div")`
  color: #000000;
  font-family: ${pangolin.style.fontFamily};
  font-size: 14px;

  strong {
    font-size: 18px;
  }
`;

const Footer = styled("div")`
  align-items: center;
  display: flex;
  height: 38px;
  justify-content: space-between;
`;

const Wrapper = styled("div", forwardRef)`
  background-color: white;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 12px 12px 0;
`;

interface FrameProps {
  media: ResolvedMedia;
  settings: Settings;
  curator: string;

  onComplete(): void;
}

function Frame(props: FrameProps) {
  const { curator, media, settings } = props;

  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const propertyKey = includes(["top", "bottom"], settings.direction) ? "yPercent" : "xPercent";
    const propertyValue = includes(["left", "top"], settings.direction) ? -100 : 100;

    const startAngle = random(-15, 15);
    const endAngle = startAngle + random(-15, 15);

    const context = gsap.context(() => {
      gsap.set(ref.current, {
        [propertyKey]: propertyValue,
      });

      const tl = gsap.timeline({
        onComplete: props.onComplete,
      });

      tl.set(ref.current, {
        [propertyKey]: propertyValue,
        rotate: startAngle,
        opacity: 0,
      });

      tl.to(
        ref.current,
        {
          [propertyKey]: 0,
          rotate: endAngle,
          opacity: 1,
        },
        "+=1"
      );

      tl.to(
        ref.current,
        {
          [propertyKey]: propertyValue,
          opacity: 0,
        },
        `+=${settings.duration}`
      );
    });

    return () => context.revert();
  }, []);

  return (
    <Wrapper ref={ref}>
      <Media {...media} maxSize={settings.maxSize} minSize={settings.minSize} />
      <Footer>
        <Watermark />
        <Curator>
          sent by <strong>{curator}</strong>
        </Curator>
      </Footer>
    </Wrapper>
  );
}

export default Frame;
