import { Button, ConfigProvider, Form, Input, InputNumber, Layout, Select, Typography } from "antd";
import { forEach, sortBy } from "lodash";
import { useRouter } from "next/router";
import { useAsync, useSearchParam } from "react-use";

import { decodeSettings, encodeSettings } from "~/settings";

function Page() {
  const settings = useSearchParam("settings");
  const router = useRouter();

  const badgeOptions = useAsync(async () => {
    const badges = new Array<any>();

    const response = await fetch("https://badges.twitch.tv/v1/badges/global/display");
    const data = await response.json();

    forEach(data["badge_sets"], ({ versions }, name) => {
      forEach(versions, ({ title }, version) => {
        badges.push({
          value: `${name}/${version}`,
          label: title,
        });
      });
    });

    return sortBy(badges, "label");
  }, []);

  return (
    <ConfigProvider>
      <Layout style={{ minHeight: "100vh" }}>
        <Layout.Content style={{ display: "grid", placeContent: "center" }}>
          <div style={{ padding: 24, textAlign: "center" }}>
            <div>
              <Typography.Text style={{ fontSize: 28, fontWeight: 700 }}>Popim</Typography.Text>
            </div>
            <div>
              <Typography.Text type="secondary">by Seldszar</Typography.Text>
            </div>
          </div>

          <Form
            layout="vertical"
            style={{ width: 420 }}
            initialValues={decodeSettings(String(settings))}
            onFinish={(values) => router.push(`/widget/${encodeSettings(values)}`)}
          >
            <Form.Item
              label="Channel"
              name="channel"
              rules={[
                {
                  required: true,
                  message: "Please input a channel",
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item label="Command" name="command">
              <Input size="large" />
            </Form.Item>
            <Form.Item label="Direction" name="direction">
              <Select
                size="large"
                options={[
                  {
                    label: "Top",
                    value: "top",
                  },
                  {
                    label: "Left",
                    value: "left",
                  },
                  {
                    label: "Right",
                    value: "right",
                  },
                  {
                    label: "Bottom",
                    value: "bottom",
                  },
                ]}
              />
            </Form.Item>
            <Form.Item label="Minimum Size" name="minSize">
              <InputNumber size="large" style={{ width: "100%" }} addonAfter="pixels" />
            </Form.Item>
            <Form.Item label="Maximum Size" name="maxSize">
              <InputNumber size="large" style={{ width: "100%" }} addonAfter="pixels" />
            </Form.Item>
            <Form.Item label="Duration" name="duration">
              <InputNumber size="large" style={{ width: "100%" }} addonAfter="seconds" />
            </Form.Item>
            <Form.Item label="Authorized Badges" name="authorizedBadges">
              <Select showSearch size="large" mode="multiple" options={badgeOptions.value} />
            </Form.Item>
            <Form.Item label="Authorized Users" name="authorizedUsers">
              <Select size="large" mode="tags" />
            </Form.Item>
            <Form.Item>
              <Button size="large" type="primary" htmlType="submit" style={{ width: "100%" }}>
                Create Widget
              </Button>
            </Form.Item>
          </Form>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
}

export default Page;
