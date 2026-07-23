import { Platform, StyleProp, ViewStyle } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "@/lib/supabase";

type Props = {
  style?: StyleProp<ViewStyle>;
};

export default function SignInWithAppleButton({ style }: Props) {
  if (Platform.OS !== "ios") {
    return null;
  }

  async function handleSignIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No identityToken.");
      }

      const {
        error,
        data: { user },
      } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (!error && credential.fullName) {
        // Apple only provides the user's full name on the first sign-in
        // Save it to user metadata if available
        const nameParts = [];
        if (credential.fullName.givenName)
          nameParts.push(credential.fullName.givenName);
        if (credential.fullName.middleName)
          nameParts.push(credential.fullName.middleName);
        if (credential.fullName.familyName)
          nameParts.push(credential.fullName.familyName);

        const fullName = nameParts.join(" ");
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            given_name: credential.fullName.givenName,
            family_name: credential.fullName.familyName,
          },
        });
      }

    } catch (e: any) {
      console.error(e);
      if (e.code === "ERR_REQUEST_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  }

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={[{ width: 200, height: 64 }, style]}
      onPress={handleSignIn}
    />
  );
}
