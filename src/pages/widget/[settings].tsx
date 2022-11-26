import { useRouter } from "next/router";
import { useMemo } from "react";

import { decodeSettings } from "~/settings";

import Widget from "~/components/Widget";

function Page() {
  const { query } = useRouter();

  const settings = useMemo(
    () => (query.settings ? decodeSettings(query.settings as string) : null),
    [query.settings]
  );

  if (settings == null) {
    return null;
  }

  return <Widget settings={settings} />;
}

export default Page;
