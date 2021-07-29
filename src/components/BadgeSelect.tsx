import type { FC } from "react";

import PropTypes from "prop-types";
import { forwardRef } from "react";
import tw, { styled } from "twin.macro";

import Select, { SelectProps } from "@/components/Select";

const BadgeOption = styled.div`
  ${tw`flex items-center`}
`;

const BadgeTitle = styled.div`
  ${tw`flex-1 truncate`}
`;

const BadgeName = styled.div`
  ${tw`flex-none ml-2 text-gray-400 text-sm`}
`;

const BadgeSelect: FC<SelectProps<string>> = forwardRef((props, ref) => (
  <Select {...props}>
    {(option) => (
      <BadgeOption>
        <BadgeTitle>{option.label}</BadgeTitle>
        <BadgeName>{option.value}</BadgeName>
      </BadgeOption>
    )}
  </Select>
));

BadgeSelect.displayName = "BadgeSelect";
BadgeSelect.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

export default BadgeSelect;
