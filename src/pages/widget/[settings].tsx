import type { NextPage } from "next";

import { useRouter } from "next/router";
import { useMemo } from "react";
import { styled } from "twin.macro";

import { decodeSettings } from "@/settings";

import Widget from "@/components/Widget";

const Wrapper = styled.div``;

const WidgetPage: NextPage = () => {
  const { query } = useRouter();

  const settings = useMemo(
    () => (query.settings ? decodeSettings(query.settings as string) : null),
    [query.settings]
  );

  if (settings == null) {
    return null;
  }

  return (
    <Wrapper>
      <Widget settings={settings} />
    </Wrapper>
  );
};

export default WidgetPage;
