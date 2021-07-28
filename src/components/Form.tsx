import { FormHTMLAttributes, PureComponent, ReactNode } from "react";

import tw, { styled } from "twin.macro";

const Wrapper = styled.form`
  ${tw`relative`}
`;

class Form extends PureComponent<FormHTMLAttributes<HTMLFormElement>> {
  static Body = styled.div`
    ${tw``}
  `;

  static Footer = styled.div`
    ${tw`mt-6`}
  `;

  render(): ReactNode {
    const {
      props: { children, ...rest },
    } = this;

    return <Wrapper {...rest}>{children}</Wrapper>;
  }
}

export default Form;
