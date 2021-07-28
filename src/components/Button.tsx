import tw, { styled } from "twin.macro";

interface ButtonProps {
  color?: "primary" | "secondary";
}

const Button = styled.button<ButtonProps>`
  ${tw`bg-gray-500 font-medium px-4 py-3 rounded text-white transition-all w-full hover:(bg-gray-400)`}

  ${(props) => {
    switch (props.color) {
      case "primary":
        return tw`bg-pink-500 hover:(bg-pink-400)`;
    }
  }}
`;

export default Button;
