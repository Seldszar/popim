import type { FC, ReactNode } from "react";

import PropTypes from "prop-types";
import { forwardRef, useEffect, useRef } from "react";
import { useToggle } from "react-use";
import tw, { css, styled } from "twin.macro";

interface WrapperProps {
  isOpen: boolean;
}

const Wrapper = styled.div<WrapperProps>`
  ${tw`relative select-none w-full`}

  ${(props) =>
    props.isOpen &&
    css`
      ${Input} {
        ${tw`rounded-b-none`}
      }

      ${OptionList} {
        ${tw`block`}
      }
    `}
`;

const Input = styled.div`
  ${tw`appearance-none bg-gray-700 flex items-center pl-4 pr-3 rounded`}
`;

const InputValue = styled.div`
  ${tw`flex-1 py-3 truncate`}
`;

const InputArrow = styled.div`
  ${tw`flex flex-shrink-0 inset-y-0 items-center pointer-events-none ml-2 right-0`}

  svg {
    ${tw`fill-current h-6 w-6`}
  }
`;

const OptionList = styled.div`
  ${tw`absolute bg-black bg-gray-700 hidden max-h-64 overflow-auto rounded-b shadow-lg w-full z-10`}
`;

interface OptionProps {
  isSelected: boolean;
}

const Option = styled.div<OptionProps>`
  ${tw`leading-tight px-4 py-3 hover:(bg-gray-600 text-white)`}

  ${(props) => props.isSelected && tw`bg-pink-500!`}
`;

export interface SelectOption<T> {
  label: string;
  value: T;
}

export interface SelectProps<T> {
  children?: (option: SelectOption<T>) => ReactNode;
  className?: string;
  onChange?: (value: T) => void;
  options: Array<SelectOption<T>>;
  value?: T;
}

const Select: FC<SelectProps<any>> = forwardRef(
  ({ children, onChange, options, value, ...rest }, ref) => {
    const [isOpen, toggleOpen] = useToggle(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((option) => option.value === value);

    useEffect(() => {
      if (isOpen) {
        return;
      }

      wrapperRef.current?.blur();
    }, [isOpen]);

    return (
      <Wrapper
        {...rest}
        ref={wrapperRef}
        tabIndex={-1}
        onClick={toggleOpen}
        onBlur={() => toggleOpen(false)}
        isOpen={isOpen}
      >
        <Input>
          <InputValue>
            {selectedOption ? children?.(selectedOption) ?? selectedOption?.label : "\u200C"}
          </InputValue>
          <InputArrow>
            <svg viewBox="0 0 24 24">
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
            </svg>
          </InputArrow>
        </Input>
        <OptionList>
          {options.map((option) => (
            <Option
              key={option.value}
              isSelected={option === selectedOption}
              onClick={() => onChange?.(option.value)}
            >
              {children?.(option) ?? option.label}
            </Option>
          ))}
        </OptionList>
      </Wrapper>
    );
  }
);

Select.displayName = "Select";
Select.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
  value: PropTypes.any,
};

export default Select;
