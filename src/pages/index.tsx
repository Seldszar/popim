import type { NextPage } from "next";

import { vestResolver } from "@hookform/resolvers/vest";
import { forEach, sortBy } from "lodash";
import NextHead from "next/head";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import { useAsync } from "react-use";
import tw, { styled } from "twin.macro";
import vest, { enforce, test } from "vest";

import { Settings } from "@/types/settings";
import { encodeSettings } from "@/settings";

import BadgeSelect from "@/components/BadgeSelect";
import Button from "@/components/Button";
import Form from "@/components/Form";
import FormField from "@/components/FormField";
import FormFieldArray from "@/components/FormFieldArray";
import Input from "@/components/Input";
import Select, { SelectOption } from "@/components/Select";

const Wrapper = styled.div`
  ${tw`bg-gray-800 flex items-center justify-center min-h-screen text-white`}
`;

const StyledForm = styled(Form)`
  ${tw`max-w-lg p-4 w-full`}
`;

const StyledFormField = styled(FormField)`
  ${tw`mb-6`}
`;

const validationSuite = vest.create((data: Settings) => {
  test("channel", "Channel is required", () => {
    enforce(data.channel).isNotEmpty();
  });

  test("command", "Command is required", () => {
    enforce(data.command).isNotEmpty();
  });

  test("direction", "Direction is required", () => {
    enforce(data.direction).isNotEmpty();
  });

  test("duration", "Duration is required", () => {
    enforce(data.duration).isNotEmpty();
  });

  test("duration", "Duration must be positive", () => {
    enforce(data.duration).isPositive(1);
  });

  test("maxSize", "Maximum Size must be positive", () => {
    enforce(data.maxSize).isPositive(1);
  });

  test("minSize", "Minimum Size must be positive", () => {
    enforce(data.minSize).isPositive(1);
  });

  data.authorizedBadges.forEach((badge, index) => {
    test(`authorizedBadges.${index}.name`, "Name is required", () => {
      enforce(badge.name).isNotEmpty();
    });
  });

  data.authorizedUsers.forEach((badge, index) => {
    test(`authorizedUsers.${index}.name`, "Name is required", () => {
      enforce(badge.name).isNotEmpty();
    });
  });
});

const IndexPage: NextPage = () => {
  const router = useRouter();

  const badgeOptions = useAsync(async () => {
    const response = await fetch("https://badges.twitch.tv/v1/badges/global/display");
    const data = await response.json();

    const badges = new Array<SelectOption<string>>();

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

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Settings>({
    resolver: vestResolver(validationSuite),
    reValidateMode: "onSubmit",
    defaultValues: {
      command: "!popim",
      direction: "top",
      minSize: 200,
      maxSize: 400,
      duration: 8,
      authorizedBadges: [
        {
          name: "broadcaster/1",
        },
        {
          name: "moderator/1",
        },
        {
          name: "vip/1",
        },
      ],
    },
  });

  const onSubmit = handleSubmit((data) => {
    router.push(`/widget/${encodeSettings(data)}`);
  });

  return (
    <Wrapper>
      <NextHead>
        <title>Popim by Seldszar</title>
      </NextHead>
      <StyledForm onSubmit={onSubmit}>
        <Form.Body>
          <StyledFormField title="Channel" error={errors.channel}>
            {() => <Input type="text" {...register("channel")} />}
          </StyledFormField>
          <StyledFormField title="Command" error={errors.command}>
            {() => <Input type="text" {...register("command")} />}
          </StyledFormField>
          <StyledFormField title="Direction" error={errors.direction}>
            {() => (
              <Controller
                name="direction"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      { label: "Top", value: "top" },
                      { label: "Left", value: "left" },
                      { label: "Right", value: "right" },
                      { label: "Bottom", value: "bottom" },
                    ]}
                  />
                )}
              />
            )}
          </StyledFormField>
          <StyledFormField title="Minimum Size (in pixels)" error={errors.minSize}>
            {() => <Input type="number" min={1} {...register("minSize")} />}
          </StyledFormField>
          <StyledFormField title="Maximum Size (in pixels)" error={errors.maxSize}>
            {() => <Input type="number" min={1} {...register("maxSize")} />}
          </StyledFormField>
          <StyledFormField title="Duration (in seconds)" error={errors.duration}>
            {() => <Input type="number" min={1} {...register("duration")} />}
          </StyledFormField>
          <StyledFormField title="Authorized Badges">
            {() => (
              <FormFieldArray
                control={control}
                getError={(index) => errors.authorizedBadges?.[index]?.name}
                name="authorizedBadges"
              >
                {({ index }) => (
                  <Controller
                    control={control}
                    name={`authorizedBadges.${index}.name`}
                    render={({ field }) => (
                      <BadgeSelect {...field} options={badgeOptions.value ?? []} />
                    )}
                  />
                )}
              </FormFieldArray>
            )}
          </StyledFormField>
          <StyledFormField title="Authorized Users">
            {() => (
              <FormFieldArray
                control={control}
                getError={(index) => errors.authorizedUsers?.[index]?.name}
                name="authorizedUsers"
              >
                {({ index }) => (
                  <Input type="text" {...register(`authorizedUsers.${index}.name`)} />
                )}
              </FormFieldArray>
            )}
          </StyledFormField>
        </Form.Body>
        <Form.Footer>
          <Button color="primary">Create Widget</Button>
        </Form.Footer>
      </StyledForm>
    </Wrapper>
  );
};

export default IndexPage;
