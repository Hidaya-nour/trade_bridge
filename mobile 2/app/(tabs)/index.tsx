import { View, Text } from "react-native";

// This tells TypeScript these components support className
const StyledView = styled(View);
const StyledText = styled(Text);

export default function Dashboard() {
  return (
    <StyledView className="flex-1 items-center justify-center bg-gray-100">
      <StyledText className="text-2xl font-bold text-blue-600">
        Tailwind is Working 🚀
      </StyledText>
    </StyledView>
  );
}
