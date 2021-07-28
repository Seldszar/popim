import type { FC, ReactNode } from "react";
import type { FieldError } from "react-hook-form";

import PropTypes from "prop-types";
import tw, { styled } from "twin.macro";

const Wrapper = styled.div`
  ${tw`block`}
`;

const Title = styled.div`
  ${tw`mb-1`}
`;

const HelpText = styled.div`
  ${tw`mt-1 text-sm`}
`;

const ErrorText = styled.div`
  ${tw`font-medium mt-1 text-red-500 text-sm`}
`;

interface Props {
  children?: (error?: FieldError) => ReactNode;
  error?: FieldError;
  className?: string;
  helpText?: string;
  title?: string;
}

const FormField: FC<Props> = (props) => (
  <Wrapper className={props.className}>
    {props.title && <Title>{props.title}</Title>}
    {props.children?.(props.error)}
    {props.helpText && <HelpText>{props.helpText}</HelpText>}
    {props.error && <ErrorText>{props.error.message}</ErrorText>}
  </Wrapper>
);

FormField.propTypes = {
  children: PropTypes.func,
  error: PropTypes.any,
  className: PropTypes.string,
  helpText: PropTypes.string,
  title: PropTypes.string,
};

export default FormField;
