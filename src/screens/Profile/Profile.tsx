// src/screens/Profile/Profile.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/AuthContext";
import { fetchAuthSession, updatePassword } from "aws-amplify/auth";
import colors from "../../styles/colors";
import { ExtendedUser, getMyProfile, updateMyProfile } from "../../services/profile";

type Question = { qid: string; title: string; reply_count: number; likes: number };

const Card = ({ children, style }: { children: React.ReactNode; style?: object }) => (
  <View
    style={[
      {
        backgroundColor: colors.base.background,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.base.border,
        flex: 1,
      },
      style,
    ]}
  >
    {children}
  </View>
);

export default function Profile({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const { user, signOut } = useAuth();
  const [extended, setExtended] = useState<ExtendedUser | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [dobDraft, setDobDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");

  // Password change
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const profile = await getMyProfile();
        setExtended(profile);
        setNameDraft(profile.name ?? user.name ?? "");
        setEmailDraft(profile.email ?? user.email ?? "");
        setDobDraft(profile.dob ?? "");
        setBioDraft(profile.bio ?? "");

        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        const qRes = await fetch("http://localhost:5000/questions/me?limit=5&sort=recent", {
          headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
        });
        if (qRes.ok) {
          const data = await qRes.json();
          setQuestions(data.items || []);
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      if (!extended) return;
      const updated = await updateMyProfile({
        name: nameDraft,
        email: emailDraft,
        dob: dobDraft,
        bio: bioDraft,
      });
      setExtended(updated);
      setEditing(false);
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const handleChangePassword = async () => {
    try {
      setSavingPass(true);
      await updatePassword({ oldPassword: oldPass, newPassword: newPass });
      alert("Password updated successfully");
      setOldPass("");
      setNewPass("");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSavingPass(false);
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>No user logged in.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.aqua.dark} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
        backgroundColor: colors.base.background,
        gap: 16,
      }}
    >
      {/* Header row */}
      <Card
        style={{
          flexDirection: isWide ? "row" : "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          padding: 24,
          minHeight: 250,
        }}
      >
        {/* Left column: Avatar + info */}
        <View style={{ alignItems: "flex-start", width: 260 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.aqua.light,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 40, fontWeight: "800", color: colors.aqua.text }}>
              {nameDraft?.slice(0, 1).toUpperCase() ??
                emailDraft?.slice(0, 1).toUpperCase() ??
                "?"}
            </Text>
          </View>

          {editing ? (
            <>
              <TextInput
                value={nameDraft}
                onChangeText={setNameDraft}
                placeholder="Full Name"
                style={{
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  borderRadius: 6,
                  padding: 8,
                  backgroundColor: "white",
                  marginBottom: 6,
                  width: "100%",
                }}
              />
              <TextInput
                value={emailDraft}
                onChangeText={setEmailDraft}
                placeholder="Email"
                autoCapitalize="none"
                style={{
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  borderRadius: 6,
                  padding: 8,
                  backgroundColor: "white",
                  marginBottom: 6,
                  width: "100%",
                }}
              />
              <TextInput
                value={dobDraft}
                onChangeText={setDobDraft}
                placeholder="Date of Birth"
                style={{
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  borderRadius: 6,
                  padding: 8,
                  backgroundColor: "white",
                  marginBottom: 6,
                  width: "100%",
                }}
              />
              <TextInput
                value={bioDraft}
                onChangeText={setBioDraft}
                placeholder="Enter your bio"
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  borderRadius: 6,
                  padding: 8,
                  backgroundColor: "white",
                  marginBottom: 6,
                  width: "100%",
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
              />
              <Pressable
                onPress={handleSaveProfile}
                style={{
                  backgroundColor: colors.aqua.dark,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>Save</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.base.text }}>
                {extended?.name ?? nameDraft}
              </Text>
              <Text style={{ color: colors.base.muted, fontSize: 13, marginBottom: 4 }}>
                {extended?.email ?? emailDraft}
              </Text>
              <Text style={{ color: colors.base.muted, fontSize: 13, marginBottom: 8 }}>
                {extended?.dob ?? dobDraft}
              </Text>
              <Text style={{ color: colors.base.text, marginBottom: 12 }}>
                {extended?.bio ?? bioDraft}
              </Text>
              <Pressable
                onPress={() => setEditing(true)}
                style={{
                  backgroundColor: colors.aqua.dark,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>Edit Profile</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Right column: Change Password + Signout */}
        <View style={{ flex: 1, alignItems: "flex-end", gap: 12 }}>
          {/* Change password box */}
          <View
            style={{
              width: 260,
              backgroundColor: colors.peach.light,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.base.border,
            }}
          >
            <Text style={{ fontWeight: "700", marginBottom: 6 }}>Change Password</Text>
            <TextInput
              secureTextEntry
              value={oldPass}
              onChangeText={setOldPass}
              placeholder="Current password"
              style={{
                borderWidth: 1,
                borderColor: colors.base.border,
                borderRadius: 6,
                padding: 8,
                backgroundColor: "white",
                marginBottom: 6,
              }}
            />
            <TextInput
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
              placeholder="New password"
              style={{
                borderWidth: 1,
                borderColor: colors.base.border,
                borderRadius: 6,
                padding: 8,
                backgroundColor: "white",
                marginBottom: 8,
              }}
            />
            <Pressable
              disabled={savingPass}
              onPress={handleChangePassword}
              style={{
                backgroundColor: colors.peach.dark,
                paddingVertical: 6,
                borderRadius: 6,
                alignItems: "center",
                opacity: savingPass ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                {savingPass ? "Saving..." : "Save Password"}
              </Text>
            </Pressable>
          </View>

          {/* Sign out */}
          <Pressable
            onPress={async () => {
              await signOut();
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            }}
            style={{
              backgroundColor: "crimson",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Sign out</Text>
          </Pressable>
        </View>
      </Card>

      {/* Second row: Children + Privacy */}
      <View style={{ flexDirection: isWide ? "row" : "column", gap: 16 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8, color: colors.base.text }}>
            Children
          </Text>
          {extended?.children?.length ? (
            extended.children.map((c, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  backgroundColor: colors.aqua.light,
                  borderRadius: 12,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: colors.base.border,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.aqua.normal,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.aqua.text }}>
                    {c.name.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.base.text }}>
                    {c.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.base.muted }}>{c.age} yrs old</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.base.muted }}>No children</Text>
          )}
        </Card>

        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8, color: colors.base.text }}>
            Privacy Settings
          </Text>
          {[
            "Full Name",
            "Email",
            "Date of Birth",
            "Children Names",
            "Children Ages",
            "Questions",
            "Likes",
            "Replies",
          ].map((field) => (
            <View
              key={field}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
            >
              <Text style={{ flex: 1, color: colors.base.text }}>{field}:</Text>
              <Picker
                selectedValue={extended?.privacy?.[field.toLowerCase().replace(" ", "_")] ?? "public"}
                onValueChange={(v) => console.log(`Update ${field} ->`, v)}
                style={{ flex: 1, height: 30, color: colors.base.text }}
                dropdownIconColor={colors.base.text}
              >
                <Picker.Item label="Public" value="public" />
                <Picker.Item label="Private" value="private" />
              </Picker>
            </View>
          ))}
        </Card>
      </View>

      {/* Questions */}
      <Card style={{ minHeight: 200 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", flex: 1, color: colors.base.text }}>
            Your Questions
          </Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => navigation.navigate("MyQuestions")}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: colors.aqua.light,
              }}
            >
              <Text style={{ color: colors.aqua.text, fontWeight: "600" }}>See more</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("SavedForums")}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: colors.peach.light,
              }}
            >
              <Text style={{ color: colors.peach.text, fontWeight: "600" }}>Saved Forums</Text>
            </Pressable>
          </View>
        </View>

        {questions.length > 0 ? (
          questions.map((q) => (
            <Pressable
              key={q.qid}
              onPress={() => navigation.navigate("QuestionDetail", { qid: q.qid })}
              style={{
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: colors.base.border,
              }}
            >
              <Text style={{ fontWeight: "600", color: colors.base.text }}>{q.title}</Text>
              <Text style={{ color: colors.base.muted, fontSize: 13 }}>
                💬 {q.reply_count} • 🤍 {q.likes}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={{ color: colors.base.muted }}>No questions yet.</Text>
        )}
      </Card>
    </ScrollView>
  );
}
