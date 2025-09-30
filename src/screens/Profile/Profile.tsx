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
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useAuth } from "../../context/AuthContext";
import { updatePassword } from "aws-amplify/auth";
import colors from "../../styles/colors";
import { ExtendedUser, getMyProfile, updateMyProfile, addChild } from "../../services/profile";
import { listMyQuestions } from "../../services/forum";

type Question = { qid: string; title: string; reply_count: number; likes: number };
type PrivacyLevel = "public" | "private" | "friends";

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

// helpers
const pad2 = (n: number) => String(n).padStart(2, "0");
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export default function Profile({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const { user, signOut } = useAuth();
  const [extended, setExtended] = useState<ExtendedUser | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

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

  const [privacyDraft, setPrivacyDraft] = useState<Record<string, PrivacyLevel>>({});

  // Add child state
  const [addingChild, setAddingChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [childDob, setChildDob] = useState(new Date(2020, 0, 1));
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [savingChild, setSavingChild] = useState(false);

  const childDobStr = toYMD(childDob);

  const handleDobChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set" && selected) setChildDob(selected);
      setShowDobPicker(false);
      return;
    }
    if (selected) setChildDob(selected);
  };

  // 🔹 Fetch profile
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
        setPrivacyDraft(profile.privacy || {});
      } catch (e) {
        console.error("Failed to load profile:", e);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [user]);

  // Fetch questions
  useEffect(() => {
    (async () => {
      try {
        setLoadingQuestions(true);
        const data = await listMyQuestions({});
        setQuestions((data.items as Question[]) || []);
      } catch (err) {
        console.error("Error fetching my questions:", err);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    })();
  }, []);

  const handleSaveProfile = async () => {
    try {
      if (!extended) return;
      const updated = await updateMyProfile({
        name: nameDraft,
        email: emailDraft,
        dob: dobDraft,
        bio: bioDraft,
        privacy: privacyDraft,
      });
      setExtended(updated);
      setEditing(false);
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const handleSaveChild = async () => {
    try {
      setSavingChild(true);
      const newChild = await addChild({ name: childName, dob: childDobStr });
      setExtended((prev) =>
        prev ? { ...prev, children: [...(prev.children || []), newChild] } : prev
      );
      setChildName("");
      setChildDob(new Date(2020, 0, 1));
      setAddingChild(false);
    } catch (e) {
      console.error("Failed to add child:", e);
      alert("Failed to add child");
    } finally {
      setSavingChild(false);
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

  if (loadingProfile && loadingQuestions) {
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
        {/* Left column */}
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
                  backgroundColor: colors.aqua.normal,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: colors.aqua.text, fontWeight: "700" }}>Save</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 20, fontWeight: "800", color: colors.base.text }}>
                {extended?.name ?? nameDraft}
              </Text>
              <Text style={{ color: colors.base.muted, fontSize: 14, marginBottom: 4 }}>
                {extended?.email ?? emailDraft}
              </Text>
              <Text style={{ color: colors.base.muted, fontSize: 14, marginBottom: 8 }}>
                {extended?.dob ?? dobDraft}
              </Text>
              <Text style={{ color: colors.base.text, marginBottom: 12, fontSize: 15 }}>
                {extended?.bio ?? bioDraft}
              </Text>
              <Pressable
                onPress={() => setEditing(true)}
                style={{
                  backgroundColor: colors.aqua.normal,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: colors.aqua.text, fontWeight: "700" }}>Edit Profile</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Right column */}
        <View style={{ flex: 1, alignItems: "flex-end", gap: 12 }}>
          {/* Change password */}
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
            <Text style={{ fontWeight: "700", marginBottom: 6, fontSize: 16 }}>
              Change Password
            </Text>
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
                paddingVertical: 8,
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
              backgroundColor: colors.peach.dark,
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
          {/* Children header with + button */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Text
              style={{ fontSize: 20, fontWeight: "800", flex: 1, color: colors.base.text }}
            >
              Children
            </Text>
            <Pressable
              onPress={() => setAddingChild((p) => !p)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.aqua.normal,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.aqua.dark, fontSize: 20, fontWeight: "700" }}>+</Text>
            </Pressable>
          </View>

          {/* Inline Add Child Box */}
          {addingChild && (
            <View
              style={{
                backgroundColor: colors.peach.light,
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.base.border,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontWeight: "700", marginBottom: 6, fontSize: 16 }}>Add Child</Text>
              <TextInput
                value={childName}
                onChangeText={setChildName}
                placeholder="Child name"
                style={{
                  borderWidth: 1,
                  borderColor: colors.base.border,
                  borderRadius: 6,
                  padding: 8,
                  backgroundColor: "white",
                  marginBottom: 6,
                }}
              />

              <Text style={{ fontWeight: "500", marginBottom: 4, fontSize: 15 }}>Date of Birth</Text>

              {Platform.OS === "web" ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.base.border,
                    borderRadius: 6,
                    backgroundColor: colors.base.background,
                    height: 44,
                    justifyContent: "center",
                    paddingHorizontal: 8,
                    marginBottom: 8,
                  }}
                >
                  {/* @ts-ignore */}
                  <input
                    type="date"
                    value={childDobStr}
                    max={toYMD(new Date())}
                    onChange={(e: any) => {
                      const [yy, mm, dd] = e.target.value.split("-").map((s: string) => parseInt(s, 10));
                      if (yy && mm && dd) setChildDob(new Date(yy, mm - 1, dd));
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      outline: "none",
                      backgroundColor: "transparent",
                      fontSize: 15,
                      color: colors.base.text,
                    }}
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setShowDobPicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.base.border,
                      borderRadius: 6,
                      backgroundColor: "white",
                      paddingHorizontal: 12,
                      height: 44,
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: colors.base.text }}>{childDobStr}</Text>
                  </TouchableOpacity>

                  {Platform.OS === "android" && showDobPicker && (
                    <DateTimePicker
                      value={childDob}
                      mode="date"
                      display="calendar"
                      maximumDate={new Date()}
                      onChange={handleDobChange}
                    />
                  )}

                  {Platform.OS === "ios" && (
                    <Modal visible={showDobPicker} transparent animationType="slide">
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "flex-end",
                          backgroundColor: "rgba(0,0,0,0.3)",
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: colors.base.background,
                            padding: 12,
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              marginBottom: 8,
                            }}
                          >
                            <Pressable onPress={() => setShowDobPicker(false)}>
                              <Text style={{ color: "crimson", fontWeight: "600" }}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={() => setShowDobPicker(false)}>
                              <Text style={{ color: colors.base.text, fontWeight: "700" }}>Done</Text>
                            </Pressable>
                          </View>
                          <DateTimePicker
                            value={childDob}
                            mode="date"
                            display="spinner"
                            maximumDate={new Date()}
                            onChange={handleDobChange}
                            style={{ backgroundColor: colors.base.background }}
                          />
                        </View>
                      </View>
                    </Modal>
                  )}
                </>
              )}

              <Pressable
                disabled={savingChild}
                onPress={handleSaveChild}
                style={{
                  backgroundColor: colors.peach.dark,
                  paddingVertical: 8,
                  borderRadius: 6,
                  alignItems: "center",
                  opacity: savingChild ? 0.6 : 1,
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>
                  {savingChild ? "Saving..." : "Save Child"}
                </Text>
              </Pressable>
            </View>
          )}

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
            <Text style={{ color: colors.base.muted, fontSize: 14 }}>No children</Text>
          )}
        </Card>

        {/* Privacy settings */}
        <Card>
          <Text
            style={{ fontSize: 20, fontWeight: "800", marginBottom: 8, color: colors.base.text }}
          >
            Privacy Settings
          </Text>
          {Object.entries({
            name: "Full Name",
            email: "Email",
            dob: "Date of Birth",
            children_names: "Children Names",
            children_ages: "Children Ages",
            questions: "Questions",
            likes: "Likes",
            replies: "Replies",
          }).map(([key, label]) => (
            <View
              key={key}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
            >
              <Text style={{ flex: 1, color: colors.base.text, fontSize: 15 }}>{label}:</Text>
              <Picker
                selectedValue={privacyDraft[key] ?? "public"}
                onValueChange={async (v) => {
                  const value = v as PrivacyLevel;
                  setPrivacyDraft((prev) => ({ ...prev, [key]: value }));
                  try {
                    await updateMyProfile({
                      privacy: { ...(privacyDraft || {}), [key]: value },
                    });
                  } catch (e) {
                    console.error("Failed to update privacy:", e);
                  }
                }}
                style={{ flex: 1, height: 30, color: colors.base.text }}
                dropdownIconColor={colors.base.text}
              >
                <Picker.Item label="Public" value="public" />
                <Picker.Item label="Friends" value="friends" />
                <Picker.Item label="Private" value="private" />
              </Picker>
            </View>
          ))}
        </Card>
      </View>

      {/* Questions */}
      <Card style={{ minHeight: 200 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <Text
            style={{ fontSize: 20, fontWeight: "800", flex: 1, color: colors.base.text }}
          >
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
              <Text style={{ color: colors.peach.text, fontWeight: "600" }}>
                Saved Forums
              </Text>
            </Pressable>
          </View>
        </View>

        {loadingQuestions ? (
          <ActivityIndicator size="small" color={colors.aqua.dark} />
        ) : questions.length > 0 ? (
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
              <Text style={{ fontWeight: "600", color: colors.base.text, fontSize: 15 }}>
                {q.title}
              </Text>
              <Text style={{ color: colors.base.muted, fontSize: 13 }}>
                💬 {q.reply_count} • 🤍 {q.likes}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={{ color: colors.base.muted, fontSize: 14 }}>No questions yet.</Text>
        )}
      </Card>
    </ScrollView>
  );
}
