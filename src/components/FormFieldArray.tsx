import type { ArrayPath, Control, FieldError, FieldArrayWithId } from "react-hook-form";
import type { FC, ReactNode } from "react";

import { useFieldArray } from "react-hook-form";
import tw, { styled } from "twin.macro";

import { Settings } from "@/types/settings";

import Button from "./Button";
import FormField from "./FormField";

const StyledFormField = styled(FormField)`
  ${tw`mb-2`}

  &:last-child {
    ${tw`mb-0`}
  }
`;

const Field = styled.div`
  ${tw`flex`}

  button {
    ${tw`bg-red-500 flex-none ml-2 px-3 rounded transition hover:(bg-red-400)`}

    svg {
      ${tw`fill-current w-6`}
    }
  }
`;

const FieldControl = styled.div`
  ${tw`flex-1`}
`;

export interface FormField {
  field: FieldArrayWithId;
  index: number;
}

export interface FormFieldArrayProps {
  children: (data: FormField) => ReactNode;
  getError: (index: number) => FieldError | undefined;
  control: Control<Settings>;
  name: ArrayPath<Settings>;
}

// eslint-disable-next-line react/prop-types
const FormFieldArray: FC<FormFieldArrayProps> = ({ children, control, getError, name }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <>
      {fields.map((field, index) => (
        <StyledFormField key={field.id} error={getError(index)}>
          {() => (
            <Field>
              <FieldControl>{children({ field, index })}</FieldControl>
              <button type="button" onClick={() => remove(index)}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 13H5v-2h14v2z" />
                </svg>
              </button>
            </Field>
          )}
        </StyledFormField>
      ))}
      <Button type="button" onClick={() => append({})}>
        Add
      </Button>
    </>
  );
};

export default FormFieldArray;
