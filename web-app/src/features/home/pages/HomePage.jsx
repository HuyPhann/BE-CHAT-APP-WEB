import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import UserProfilePage from "../../../components/layout/UserProfilePage";
import ChangePasswordModal from "../../../components/layout/ChangePasswordModal";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import io from "socket.io-client";
import SearchModal from "../../auth/pages/SearchModal";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Gif } from "@giphy/react-components";
import { FaPaperPlane, FaBolt, FaBell } from "react-icons/fa";
import AddGroupModal from "../../../components/layout/AddGroupModal";
import IncomingCallModal from "../../../components/layout/IncomingCallModal";
import OutgoingCallModal from "../../../components/layout/OutgoingCallModal";
import ImageViewerModal from "../../../components/ImageViewerModal";
import GroupInfoPanel from "../../../components/layout/GroupInfoPanel";
import ReplacePinnedMessageModal from "../../../components/layout/ReplacePinnedMessageModal";
import FileViewer from "../../../components/layout/FileViewer";
import { FaAddressBook } from "react-icons/fa";
import ContactsPage from "../../../components/layout/ContactsPage";
import CreatePollModal from "../../../components/layout/CreatePollModal";
import PollMessage from "../../../components/layout/PollMessage";
// import { toast, ToastContainer } from "react-toastify";

const giphyFetch = new GiphyFetch("hKZOLjC3pTyQqbuCQa02WITnz90vCuKQ");

const HomePage = () => {
  const [contactsTab, setContactsTab] = useState(null);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messageRefs = useRef({});
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showOutgoingCallModal, setShowOutgoingCallModal] = useState(false);
  const [calleeInfo, setCalleeInfo] = useState(null);
  const callTimeoutRef = useRef(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const [callStatus, setCallStatus] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [activeMessage, setActiveMessage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("userId") || null
  );
  const [user, setUser] = useState(null);
  const [modalProfile, setModalProfile] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("Messages");
  const [profileUser, setProfileUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [showEmojiSelector, setShowEmojiSelector] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [forwardMessageId, setForwardMessageId] = useState([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastMessages, setLastMessages] = useState({});
  const [unreadConversations, setUnreadConversations] = useState({});
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const messageActionsRef = useRef({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [gifs, setGifs] = useState([]);
  const [isPinnedBarCollapsed, setIsPinnedBarCollapsed] = useState(true);
  const [isGroup, setIsGroup] = useState(false);
  const [avatarMap, setAvatarMap] = useState({});
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [showReplacePinnedModal, setShowReplacePinnedModal] = useState(false);
  const [pendingPinMessage, setPendingPinMessage] = useState(null);
  const [isSelectingMultiple, setIsSelectingMultiple] = useState(false); // Trạng thái chế độ chọn nhiều tin nhắn
  const [selectedMessages, setSelectedMessages] = useState([]); // Danh sách các tin nhắn đã chọn
  const [groupInf, setGroupInf] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const SYSTEM_USER_ID = "68356b60184881aa5558a25a";
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [birthdayUsers, setBirthdayUsers] = useState([]);
  const [socket, setSocket] = useState(() =>
    io("http://localhost:5000")
  ); // Tự động chọn "Danh sách bạn bè" khi nhấn vào tab Contacts
  useEffect(() => {
    if (newMessage.trim().length >= 1000) {
      toast.error("Tin nhắn không được vượt quá 1000 ký tự!");
      setNewMessage(""); // Cắt tin nhắn về 1000 ký tự
    }
  }, [newMessage]);

  const handleTabChange = (tab) => {
    //cần
    setActiveTab(tab);
    if (tab === "Contacts") {
      setContactsTab("friends"); // Mặc định chọn "Danh sách bạn bè"
      setSelectedUser(null); // Reset selectedUser
    } else {
      setContactsTab(null); // Reset contactsTab khi không ở tab Contacts
    }
  };

  // Hàm xử lý khi nhấn "Danh sách bạn bè" hoặc "Danh sách nhóm"
  const handleContactsTabChange = (tab) => {
    setContactsTab(tab); // Cập nhật tab được chọn
    setSelectedUser(null); // Reset selectedUser để không hiển thị cuộc trò chuyện
  };

  const handleSelectItems = (items) => {
    setSelectedItems(items); // Cập nhật danh sách đã lọc
    setSelectedUser(items[0] || null); // Chọn item đầu tiên để chat (nếu có)
  };

  const handleShowGroupInfo = () => {
    setShowGroupInfoModal((prev) => !prev);
  };
  const handleImageClick = (url) => {
    setSelectedImage(url);
    setViewerModalOpen(true);
  };
  useEffect(() => {
    const fetchAvatars = async () => {
      const newAvatars = {};
      for (const msg of messages) {
        if (!msg.fromSelf && !avatarMap[msg.sender]) {
          const avatar = await getAvatarSender(msg.sender);
          newAvatars[msg.sender] = avatar;
        }
      }
      setAvatarMap((prev) => ({ ...prev, ...newAvatars }));
    };

    fetchAvatars();
  }, [messages]);
  const allImages = messages
    .filter(
      (msg) =>
        msg.isImage &&
        !msg.recalled &&
        !msg.deletedForMe &&
        msg.fileUrls?.length > 0
    )
    .flatMap((msg) => msg.fileUrls);
  const getAvatarSender = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/id/${id}`
      );
      // console.log("User found:", response.data);
      return response.data.avatar || "/default-avatar.png";
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("User not found, returning default avatar");
        return "/default-avatar.png";
      }
      throw error; // Re-throw other errors
    }
  };

  // Hàm bỏ ghim tin nhắn
  const handleUnpinMessage = async (messageId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/messages/unpinmsg/${messageId}`,
        {
          userId: currentUserId,
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, pinned: false } : msg
        )
      );

      setPinnedMessages((prev) => prev.filter((msg) => msg._id !== messageId));

      setLastAction("unpin");

      socket.emit("unpin-message", {
        from: currentUserId,
        to: selectedUser?.id,
        messageId,
      });

      toast.success("Đã bỏ ghim tin nhắn");
    } catch (error) {
      console.error("Lỗi khi bỏ ghim tin nhắn:", error);
      toast.error("Không thể bỏ ghim tin nhắn!");
    }
  };

  //hàm gọi video
  const startCall = (toUserId) => {
    if (selectedUser.status !== "Active now") {
      toast.error("Người dùng đang offline!");
      return;
    }

    const fixedRoomID = "room-test-video-call";
    setCallStatus("calling");

    // Thiết lập thông tin người nhận (callee)
    const callee = {
      name: selectedUser.name,
      id: toUserId,
      avatar: selectedUser.avatar,
    };
    setCalleeInfo(callee);
    setShowOutgoingCallModal(true);

    // Gửi tín hiệu gọi đến người nhận
    socket.emit("callUser", {
      userToCall: toUserId,
      signalData: fixedRoomID,
      from: currentUserId,
      name: user?.fullName || "Người gọi",
    });

    // Thiết lập timeout (ví dụ: 30 giây)
    callTimeoutRef.current = setTimeout(() => {
      socket.emit("callTimeout", { to: toUserId });
      setShowOutgoingCallModal(false);
      setCalleeInfo(null);
      setCallStatus(null);
      navigate("/"); // Quay về trang home nếu hết thời gian
      toast.info("Cuộc gọi hết thời gian, không có phản hồi.");
    }, 30000); // 30 giây
  };
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (showGifPicker) {
      const fetchGifs = async () => {
        try {
          const { data } = await giphyFetch.trending({ limit: 10 });
          if (isMounted.current) {
            setGifs(data);
          }
        } catch (error) {
          console.error("Không thể lấy GIF:", error);
        }
      };
      fetchGifs();
    }
  }, [showGifPicker]);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendGif = (gif) => {
    const gifUrl = gif.images.original.url;
    handleSendMessage({ message: gifUrl, isGif: true });
    setShowGifPicker(false);
  };

  const emojiOptions = ["👍", "❤️", "😆", "😲", "😢", "😡"];

  const moveConversationToTop = (userId) => {
    setConversations((prevConversations) => {
      const updatedConversations = [...prevConversations];
      const userIndex = updatedConversations.findIndex(
        (conv) => conv.id === userId
      );

      if (userIndex !== -1) {
        const [userConversation] = updatedConversations.splice(userIndex, 1);
        updatedConversations.unshift(userConversation);
      }

      setFilteredConversations((prevFiltered) => {
        if (searchQuery.trim() === "") {
          return updatedConversations;
        } else {
          return updatedConversations.filter((conv) =>
            conv.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      });

      return updatedConversations;
    });
  };

  const sendMediaMessage = async (
    from,
    to,
    files = [],
    text = "",
    emoji = ""
  ) => {
    const formData = new FormData();
    formData.append("from", from);
    formData.append("to", to);
    files.forEach((file, index) => {
      formData.append("files", {
        uri: file.uri,
        name: file.name || `upload-${index}.jpg`,
        type: file.type || "application/octet-stream",
      });
    });

    if (text) formData.append("text", text);
    if (emoji) formData.append("emoji", emoji);

    try {
      console.log("Client sending multiple files", formData);
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      const response = await axios.post(
        "http://localhost:5000/api/messages/sendmedia",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error sending media message:", error);
      throw error;
    }
  };

  const handleUnfriend = async (friendId) => {
    try {
      const result = await Swal.fire({
        title: "XÓA BẠN",
        text: "Bạn có chắc chắn xóa bạn ?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Có",
        cancelButtonText: "Trở lại",
      });
      if (result.isConfirmed) {
        const response = await axios.post(
          "http://localhost:5000/api/friends/unfriend-friend",
          {
            idUser1: currentUserId,
            idUser2: friendId,
          }
        );
        if (response.status === 200) {
          Swal.fire("Success!", `Removed members.`, "success");
          // window.location.reload(); // Reload the page to reflect changes
        } else {
          Swal.fire(
            "Failed!",
            response.data.message || "Unable to remove members.",
            "error"
          );
        }
      }
      // await axios.post(
      //   "http://localhost:5000/api/messages/delete-conversation",
      //   {
      //     userId1: currentUserId,
      //     userId2: friendId,
      //   }
      // );

      // socket.emit("delete-conversation", {
      //   userId1: currentUserId,
      //   userId2: friendId,
      // });

      // await fetchConversations();

      // if (selectedUser && selectedUser.id === friendId) {
      //   setSelectedUser(null);
      //   setMessages([]);
      // }

      // setShowUserProfile(false);
      // setProfileUser(null);

      // socket.emit("unfriend", {
      //   from: currentUserId,
      //   to: friendId,
      // });
    } catch (error) {
      console.error("Error removing friend:", error);
      Swal.fire("Error!", "Không còn là bạn bè!", "error");
    }
  };

  const handleUnGroup = async (id) => {
    const result = await Swal.fire({
      title: "XÓA THÀNH VIÊN",
      text: "Bạn có chắc chắn xóa thành viên này khỏi nhóm ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Có, tôi chắc chắn",
      cancelButtonText: "Trở lại",
    });
    try {
      if (result.isConfirmed) {
        console.log("memberId:", id, " groupId:", groupInf._id);
        const response = await axios.post(
          "http://localhost:5000/api/groups/remove-member",
          {
            groupId: groupInf._id,
            memberIds: [id],
            requesterId: currentUserId,
          }
        );
        Swal.fire("Success!", `Removed members.`, "success");
        // await fetchConversations(groupInf._id); // Hàm để lấy lại thông tin nhóm
        setShowUserProfile(false);
        setProfileUser(null);
        // window.location.reload(); // Reload the page to reflect changes
      }
      // await fetchConversations();
      // setSelectedUser(null);
      // // setMessages([]);
      setShowUserProfile(false);
      // setProfileUser(null);
    } catch (error) {
      console.error("Error removing members:", error);
      Swal.fire("Error!", "Người này đã được xóa!", "error");
    }
  };
  const handleShowProfile = (userInfo) => {
    setProfileUser({
      _id: userInfo.id,
      fullName: userInfo.name,
      avatar: userInfo.avatar,
      phoneNumber: userInfo.phoneNumber,
      birthday: userInfo.birthday,
      gender: userInfo.gender,
      status: userInfo.status,
    });
    setShowUserProfile(true);
  };
  const handleShowProfile1 = async (userInfo) => {
    try {
      console.log("userInfo", userInfo);
      const response = await axios.get(
        `http://localhost:5000/api/users/id/${userInfo}`
      );
      const userData = response.data;
      console.log("userData", userData);
      setProfileUser({
        _id: userData._id,
        fullName: userData.fullName,
        avatar: userData.avatar,
        phoneNumber: userData.phoneNumber,
        birthday: userData.birthDate,
        gender: userData.gender,
        status: userData.status,
      });
      setShowUserProfile(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSendBirthdayWish = (user) => {
    const birthdayMessages = [
      "🎉 Chúc mừng sinh nhật! Mong bạn luôn hạnh phúc và thành công!",
      "🎂 Chúc bạn một ngày sinh nhật thật nhiều niềm vui và tiếng cười!",
      "🎁 Sinh nhật vui vẻ nhé! Chúc mọi điều ước của bạn trở thành hiện thực!",
      "🌟 Mong rằng tuổi mới sẽ mang đến cho bạn nhiều trải nghiệm tuyệt vời!",
    ];

    const inputOptions = birthdayMessages.reduce((options, msg, index) => {
      options[index] = msg;
      return options;
    }, {});

    Swal.fire({
      title: "🎈 Gửi lời chúc mừng sinh nhật",
      input: "select",
      inputOptions,
      inputPlaceholder: "🎉 Chọn một lời chúc",
      showCancelButton: true,
      confirmButtonText: "🎉 Gửi lời chúc",
      cancelButtonText: "❌ Hủy",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        input: "custom-swal-input",
        actions: "custom-swal-actions",
        confirmButton: "custom-swal-confirm",
        cancelButton: "custom-swal-cancel",
      },
      width: "600px", // ✅ Chiều ngang cụ thể
      maxWidth: "90vw", // ✅ Giới hạn không vượt quá 90% chiều ngang màn hình
      padding: "1.5rem",
      backdrop: `rgba(0,0,0,0.5)`,
      color: "#333",
      didOpen: () => {
        const selectElement = Swal.getInput();
        if (selectElement) {
          selectElement.style.maxHeight = "150px";
          selectElement.style.overflowY = "auto";
          selectElement.style.whiteSpace = "normal"; // ✅ Để nội dung option xuống dòng nếu dài
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedMsg = birthdayMessages[result.value];
        handleSendMessage({ message: selectedMsg });
        toast.success(`🎉 Đã gửi lời chúc mừng sinh nhật đến ${user.name}!`);
      }
    });
  };

  const fetchUserData = async (userId) => {
    try {
      if (!userId) {
        console.error("Không tìm thấy userId trong localStorage");
        setUserAvatar(null);
        setUser(null);
        // Chỉ điều hướng nếu không phải đang ở trang đăng nhập
        if (window.location.pathname !== "/login") {
          navigate("/login");
        }
        return;
      }
      const response = await axios.get(
        `http://localhost:5000/api/users/id/${userId}`
      );
      const userData = response.data;
      setUser(userData);
      setUserAvatar(userData.avatar || null);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user từ backend:", error);
      setUser(null);
      setUserAvatar(null);
      // Chỉ điều hướng nếu lỗi là do không xác thực được (401, 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("userId");
        navigate("/login");
      }
    }
  };
  const fetchConversations = async () => {
    try {
      const API_BASE_URL = "http://localhost:5000";
      const lastMessagesResponse = await axios.get(
        `${API_BASE_URL}/api/messages/lastmessages/${currentUserId}`
      );
      const friendResponse = await axios.get(
        `${API_BASE_URL}/api/friends/get-friend/${currentUserId}`
      );
      const groupResponse = await axios.get(
        `${API_BASE_URL}/api/groups/member/${currentUserId}`
      );

      const friendMap = new Map(
        friendResponse.data.map(({ friendInfo }) => [
          friendInfo._id,
          friendInfo,
        ])
      );
      const groupMap = new Map(
        groupResponse.data.map((group) => [group._id, group])
      );

      const allConvs = [];
      const lastMessagesData = {};

      // Lấy ngày hiện tại
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth() + 1; // getMonth() trả về 0-11, cần +1

      for (const msg of lastMessagesResponse.data) {
        const convId =
          msg.groupId || msg.users.find((uid) => uid !== currentUserId);
        const lastMessageContent =
          msg.message.length > 35
            ? `${msg.message.slice(0, 35)}...`
            : msg.message;

        let displayLastMessage;

        if (msg.groupId) {
          displayLastMessage = lastMessageContent || "";
          const group = groupMap.get(convId);
          if (group) {
            allConvs.push({
              id: group._id,
              name: group.groupName || "Unnamed Group",
              status: "",
              avatar: group.avatar || "/default-group-avatar.png",
              lastMessage: displayLastMessage,
              type: "group",
            });
          } else {
            allConvs.push({
              id: convId,
              name: "Archived Group",
              status: "",
              avatar: "/default-group-avatar.png",
              lastMessage: displayLastMessage,
              type: "archived_group",
            });
          }
        } else {
          let friend = friendMap.get(convId);
          if (!friend) {
            try {
              const userResponse = await axios.get(
                `${API_BASE_URL}/api/users/id/${convId}`
              );
              friend = userResponse.data;
            } catch (error) {
              console.warn(`User ${convId} not found:`, error);
              friend = {
                _id: convId,
                fullName: "Deleted User",
                avatar: "/default-avatar.png",
                status: "Offline",
              };
            }
          }
          if (friend._id !== currentUserId) {
            displayLastMessage = lastMessageContent || "";
            if (friend.birthDate) {
              const birthDate = new Date(friend.birthDate);
              const birthDay = birthDate.getDate();
              const birthMonth = birthDate.getMonth() + 1;
              if (birthDay === todayDay && birthMonth === todayMonth) {
                displayLastMessage = `🎉 Hôm nay là sinh nhật của ${friend.fullName}!`;
              }
            }

            allConvs.push({
              id: friend._id,
              name: friend.fullName || "Deleted User",
              status: friend.status === "online" ? "Active now" : "Offline",
              avatar: friend.avatar || "/default-avatar.png",
              lastMessage: displayLastMessage,
              phoneNumber: friend.phoneNumber || "",
              birthday: friend.birthDate || "",
              gender: friend.gender || "",
              type: "friend",
            });
          }
        }

        lastMessagesData[convId] = {
          content: displayLastMessage,
          fromSelf: msg.fromSelf,
          createdAt: msg.createdAt,
        };
      }

      allConvs.sort((a, b) => {
        const aTime = lastMessagesData[a.id]?.createdAt || 0;
        const bTime = lastMessagesData[b.id]?.createdAt || 0;
        return new Date(bTime) - new Date(aTime);
      });

      // Lọc danh sách người có sinh nhật hôm nay
      const birthdayFriends = allConvs.filter((conv) => {
        if (conv.birthday) {
          const birthDate = new Date(conv.birthday);
          const birthDay = birthDate.getDate();
          const birthMonth = birthDate.getMonth() + 1;
          return birthDay === todayDay && birthMonth === todayMonth;
        }
        return false;
      });

      setConversations(allConvs);
      setFilteredConversations(allConvs);
      setLastMessages(lastMessagesData);
      setBirthdayUsers(birthdayFriends); // Lưu danh sách người có sinh nhật

      if (selectedUser) {
        const updatedSelectedUser = allConvs.find(
          (conv) => conv.id === selectedUser.id
        );
        if (updatedSelectedUser) {
          setSelectedUser(updatedSelectedUser);
        }
      }

      return allConvs;
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      toast.error("Failed to load conversations. Please try again.");
      setConversations([]);
      setFilteredConversations([]);
      setBirthdayUsers([]);
      return [];
    }
  };
  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/friends/get-add-friend/${currentUserId}`
      );
      setFriendRequests(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu kết bạn:", error);
      toast.error("Không thể tải yêu cầu kết bạn!");
    }
  };

  const fetchMessages = async (toUserId) => {
    try {
      let isUser = true;

      // Try to get the user, but handle 404 gracefully
      try {
        const userExist = await axios.get(
          `http://localhost:5000/api/users/id/${toUserId}`
        );
        console.log("User hay Group:", userExist.data); // Uncommented for debugging
        console.log("Avatar:", getAvatarSender(toUserId));
      } catch (error) {
        // If 404, then it's not a user, so it's a group
        if (error.response && error.response.status === 404) {
          isUser = false;
        } else {
          // If it's another error, we should still throw it
          throw error;
        }
      }

      // console.log("currentId", currentUserId);
      // console.log("toUserId", userExist.d);

      let response = toUserId;
      if (isUser) {
        setIsGroup(false);
        response = await axios.post(
          "http://localhost:5000/api/messages/getmsg",
          {
            from: currentUserId,
            to: toUserId,
          }
        );
      } else {
        setIsGroup(true);
        response = await axios.post(
          "http://localhost:5000/api/messages/getmsg",
          {
            from: currentUserId,
            groupId: toUserId,
          }
        );
        const groupResponse = await axios.get(
          `http://localhost:5000/api/groups/id/${toUserId}`
        );
        console.log("Group Info:", groupResponse.data);
        setGroupInf(groupResponse.data);
      }

      // console.log("Tin nhắn:", response.data);
      console.log("Raw messages from server:", response.data); // Debug log

      const processedMessages = response.data
        .map((message) => {
          console.log("Processing message:", message); // Debug log

          const isImage = message.fileUrls.length > 0;
          const latestReaction =
            message.reactions && message.reactions.length > 0
              ? {
                  user: message.reactions[message.reactions.length - 1].user,
                  emoji: message.reactions[message.reactions.length - 1].emoji,
                }
              : null;

          // Xử lý poll message
          if (message.poll) {
            console.log("Found poll message:", message);
            console.log("Poll object:", message.poll);

            return {
              ...message,
              isImage,
              reaction: latestReaction,
              pinned: message.pinned || false,
              isPoll: true,
              poll: {
                ...message.poll,
                _id: message.poll._id || message._id, // Đảm bảo poll có _id
              },
            };
          }

          // Tin nhắn thường
          return {
            ...message,
            isImage,
            reaction: latestReaction,
            pinned: message.pinned || false,
          };
        })
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      console.log("Processed messages:", processedMessages); // Debug log
      setMessages(processedMessages);

      // Thêm logic để cập nhật danh sách tin nhắn ghim
      // Lấy danh sách tin nhắn ghim
      const pinnedResponse = await axios.post(
        "http://localhost:5000/api/messages/getPinnedMessages",
        {
          from: currentUserId,
          to: isUser ? toUserId : undefined,
          groupId: isUser ? undefined : toUserId,
        }
      );
      setPinnedMessages(pinnedResponse.data);
      setLastAction("fetchMessages");
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
      toast.error("Không thể tải tin nhắn!");
    }
  };

  const handleAcceptFriend = async (friendId) => {
    try {
      // Gửi yêu cầu chấp nhận kết bạn
      await axios.post(
        "http://localhost:5000/api/friends/accept-friend",
        {
          idUser1: friendId, // Người gửi lời mời
          idUser2: currentUserId, // Người chấp nhận
        }
      );

      // Hiển thị thông báo thành công
      toast.success("Đã chấp nhận yêu cầu kết bạn!");

      // Cập nhật danh sách hội thoại
      const updatedConversations = await fetchConversations();
      setConversations(updatedConversations);
      setFilteredConversations(updatedConversations);

      // Di chuyển hội thoại lên đầu
      moveConversationToTop(friendId);

      // Tìm người bạn mới
      const newFriend = updatedConversations.find(
        (conv) => conv.id === friendId
      );

      // Cập nhật danh sách yêu cầu kết bạn
      await fetchFriendRequests();

      if (newFriend) {
        // Chuyển sang tab Messages và chọn người bạn mới
        setActiveTab("Messages");
        setSelectedUser({
          ...newFriend,
          isFriend: true,
          sentPending: false,
          receivedPending: false,
        });
        fetchMessages(newFriend.id);
      } else {
        console.warn(
          `Không tìm thấy người dùng ${friendId} trong danh sách bạn bè`
        );
        toast.warning(
          "Đã chấp nhận kết bạn, nhưng danh sách bạn bè chưa cập nhật. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      console.error("Lỗi khi chấp nhận yêu cầu:", error);
      toast.error(
        error.response?.data?.message || "Không thể chấp nhận yêu cầu kết bạn!"
      );
    }
  };

  const handleRejectFriend = async (friendId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/friends/reject-friend",
        {
          idUser1: currentUserId,
          idUser2: friendId,
        }
      );
      toast.success("Đã từ chối yêu cầu kết bạn!");
      fetchFriendRequests();
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu:", error);
      toast.error("Không thể từ chối yêu cầu!");
    }
  };

  const handleSendMessage = async (options = {}) => {
    const { message = newMessage, isGif = false } = options;

    if (message.trim()) {
      const newMsg = {
        fromSelf: true,
        message: isGif ? "" : message,
        createdAt: new Date(),
        recalled: false,
        reaction: null,
        pinned: false,
        isImage: isGif,
        fileUrls: isGif ? [message] : [],
        fileTypes: isGif ? ["image/gif"] : [],
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
      setReplyingTo(null);
      setLastAction("newMessage");

      // socket.emit("stop-typing", {
      //   from: currentUserId,
      //   to: selectedUser.id,
      // });
      const formData = new FormData();
      formData.append("from", currentUserId);

      formData.append("text", isGif ? "" : message);
      formData.append("emoji", "");
      if (isGroup) {
        formData.append("groupId", selectedUser.id);
      } else {
        formData.append("to", selectedUser.id);
      }

      // Nếu là GIF, thêm từng URL vào formData
      if (isGif) {
        formData.append(
          "mediaUrls",
          JSON.stringify([
            {
              url: message,
              type: "image/gif",
            },
          ])
        );
      } else {
        formData.append("files", null);
      }
      console.log(
        "Hihihihihih:" +
          message +
          " " +
          isGif +
          " " +
          (isGif ? [message].length : 0)
      );
      try {
        const response = await axios.post(
          "http://localhost:5000/api/messages/sendmedia",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        setMessages((prev) =>
          prev.map((msg) =>
            msg.createdAt === newMsg.createdAt && msg.fromSelf
              ? { ...msg, _id: response.data.message._id }
              : msg
          )
        );

        if (isGroup) {
          // For group messages
          socket.emit("group-msg-receive", {
            groupId: selectedUser.id,
            from: currentUserId,
            message: isGif ? "" : message,
            createdAt: new Date(),
            isImage: isGif,
            fileUrls: isGif ? [message] : [],
            _id: response.data.message._id,
            replyTo: replyingTo
              ? {
                  _id: replyingTo._id,
                  message: replyingTo.message,
                  sender: replyingTo.fromSelf
                    ? currentUserId
                    : replyingTo.sender,
                }
              : null,
          });
        } else {
          // For individual messages
          socket.emit("send-msg", {
            from: currentUserId,
            to: selectedUser.id,
            message: isGif ? "" : message,
            createdAt: new Date(),
            isImage: isGif,
            fileUrls: isGif ? [message] : [],
            _id: response.data.message._id,
            replyTo: replyingTo
              ? {
                  _id: replyingTo._id,
                  message: replyingTo.message,
                  sender: replyingTo.fromSelf
                    ? currentUserId
                    : replyingTo.sender,
                }
              : null,
          });
        }

        moveConversationToTop(selectedUser.id);

        const previewMessage =
          message.slice(0, 20) + (message.length > 20 ? "..." : "");
        setLastMessages((prev) => ({
          ...prev,
          [selectedUser.id]: {
            content: previewMessage,
            fromSelf: true,
            createdAt: new Date(),
          },
        }));

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedUser.id
              ? { ...conv, lastMessage: `Bạn: ${previewMessage}` }
              : conv
          )
        );
      } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        toast.error("Không thể gửi tin nhắn!");
        setMessages((prev) => prev.filter((msg) => msg !== newMsg));
      }
    }
  };

  // Hàm cuộn đến tin nhắn
  const scrollToMessage = (messageId) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSendHeart = async () => {
    handleSendMessage({ message: "❤️" });
    // const heartMsg = {
    //   fromSelf: true,
    //   message: "❤️",
    //   createdAt: new Date(),
    //   recalled: false,
    //   reaction: null,
    //   pinned: false,
    // };

    // setMessages((prev) => [...prev, heartMsg]);
    // setReplyingTo(null);
    // setLastAction("newMessage");

    // socket.emit("stop-typing", {
    //   from: currentUserId,
    //   to: selectedUser.id,
    // });

    // try {
    //   await axios.post("http://localhost:5000/api/messages/addmsg", {
    //     from: currentUserId,
    //     to: selectedUser.id,
    //     message: "❤️",
    //   });

    //   await handleSendMessage({message: "❤️"})

    //   socket.emit("send-msg", {
    //     from: currentUserId,
    //     to: selectedUser.id,
    //     message: "❤️",
    //     createdAt: new Date(),
    //   });

    //   moveConversationToTop(selectedUser.id);

    //   setLastMessages((prev) => ({
    //     ...prev,
    //     [selectedUser.id]: {
    //       content: "❤️",
    //       fromSelf: true,
    //       createdAt: new Date(),
    //     },
    //   }));

    //   setConversations((prev) =>
    //     prev.map((conv) =>
    //       conv.id === selectedUser.id
    //         ? { ...conv, lastMessage: "Bạn: ❤️" }
    //         : conv
    //     )
    //   );
    // } catch (error) {
    //   console.error("Lỗi khi gửi tin nhắn:", error);
    //   toast.error("Không thể gửi tin nhắn!");
    //   setMessages((prev) => prev.filter((msg) => msg !== heartMsg));
    // }
  };

  const handleRecallMessage = async (messageId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/messages/recallmsg/${messageId}`,
        {
          userId: currentUserId,
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                recalled: true,
                message: "",
                fileUrls: [],
                isImage: false,
                reaction: null,
                pinned: false,
              }
            : msg
        )
      );
      setLastAction("recall");

      socket.emit("recall-message", {
        from: currentUserId,
        to: selectedUser.id,
        messageId,
      });

      toast.success("Đã thu hồi tin nhắn");
    } catch (error) {
      console.error("Lỗi thu hồi tin nhắn:", error);
      toast.error(error.response?.data?.msg || "Không thể thu hồi tin nhắn!");
    }
  };

  const handleReactMessage = async (messageId, emoji) => {
    try {
      console.log("Thả cảm xúc:", emoji);
      console.log("Message ID:", messageId);
      const response = await axios.post(
        `http://localhost:5000/api/messages/react`,
        {
          messageId: messageId,
          userId: currentUserId,
          emoji: emoji,
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, reaction: { user: currentUserId, emoji, flyIn: true } } // Thêm flyIn
            : msg
        )
      );
      setLastAction("react");

      // Xóa class fly-in sau khi animation hoàn tất (0.5s)
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  reaction: { user: currentUserId, emoji, flyIn: false },
                }
              : msg
          )
        );
      }, 900);

      setShowEmojiSelector(null);
    } catch (error) {
      console.error("Lỗi khi thả cảm xúc:", error);
      toast.error("Không thể thả cảm xúc!");
    }
  };

  // Hàm ghim tin nhắn
  const handlePinMessage = async (messageId) => {
    try {
      if (!messageId) {
        console.error("Missing messageId");
        toast.error("Không tìm thấy ID tin nhắn!");
        return;
      }

      // ✅ Tìm tin nhắn tương ứng
      const message = messages.find((msg) => msg._id === messageId);
      if (!message) {
        toast.error("Không tìm thấy tin nhắn!");
        return;
      }

      // ✅ Nếu là nhóm và người gửi không phải mình => kiểm tra quyền admin
      if (isGroup && !message.fromSelf) {
        const groupResponse = await axios.get(
          `http://localhost:5000/api/groups/id/${selectedUser.id}`
        );
        if (groupResponse.data.groupAdmin !== currentUserId) {
          Swal.fire({
            title: "Thông báo",
            text: "Chỉ admin nhóm hoặc người gửi được ghim tin nhắn!",
            icon: "warning",
            confirmButtonText: "OK",
          });
          return;
        }
      }

      // ✅ Kiểm tra giới hạn 2 ghim
      if (pinnedMessages.length >= 2) {
        setPendingPinMessage({
          messageId,
          content:
            message.message || (message.fileUrls?.length > 0 ? "[Media]" : ""),
        });
        setShowReplacePinnedModal(true);
        return;
      }

      // ✅ Gọi API ghim tin nhắn
      await axios.post(
        `http://localhost:5000/api/messages/pinmsg/${messageId}`,
        { userId: currentUserId }
      );

      // ✅ Cập nhật danh sách tin nhắn
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, pinned: true } : msg
        )
      );

      // ✅ Cập nhật pinnedMessages
      setPinnedMessages((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        {
          _id: message._id,
          senderName: message.fromSelf
            ? user?.fullName || "Bạn"
            : selectedUser?.name || "Unknown",
          content:
            message.message || (message.fileUrls?.length > 0 ? "[Media]" : ""),
          isImage: message.fileUrls?.length > 0,
          fileUrls: message.fileUrls || [],
        },
      ]);

      // ✅ Gửi sự kiện socket
      socket.emit("pin-message", {
        from: currentUserId,
        to: selectedUser.id,
        messageId,
      });

      setShowMoreMenu(null);
      toast.success("Đã ghim tin nhắn");
    } catch (error) {
      console.error("Lỗi khi ghim tin nhắn:", error.response?.data || error);
      toast.error(error.response?.data?.msg || "Không thể ghim tin nhắn!");
    }
  };

  const handleReplacePinnedMessage = async () => {
    try {
      if (!pendingPinMessage) return;

      // Bỏ ghim tin nhắn cũ nhất (ghim đầu tiên trong danh sách)
      const oldestPinned = pinnedMessages[0];
      await axios.post(
        `http://localhost:5000/api/messages/unpinmsg/${oldestPinned._id}`,
        {
          userId: currentUserId,
        }
      );

      // Cập nhật state messages và pinnedMessages để bỏ ghim cũ
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === oldestPinned._id ? { ...msg, pinned: false } : msg
        )
      );
      setPinnedMessages((prev) =>
        Array.isArray(prev)
          ? prev.filter((msg) => msg._id !== oldestPinned._id)
          : []
      );

      // Phát sự kiện socket để thông báo bỏ ghim
      socket.emit("unpin-message", {
        from: currentUserId,
        to: selectedUser?.id,
        messageId: oldestPinned._id,
      });

      // Ghim tin nhắn mới
      const message = messages.find(
        (msg) => msg._id === pendingPinMessage.messageId
      );
      const response = await axios.post(
        `http://localhost:5000/api/messages/pinmsg/${pendingPinMessage.messageId}`,
        { userId: currentUserId }
      );

      // Cập nhật messages
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === pendingPinMessage.messageId
            ? { ...msg, pinned: true }
            : msg
        )
      );

      // Cập nhật pinnedMessages
      if (message) {
        setPinnedMessages((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          {
            _id: message._id,
            senderName: message.fromSelf
              ? user?.fullName || "Bạn"
              : selectedUser?.name || "Unknown",
            content:
              message.message || (message.fileUrls.length > 0 ? "[Media]" : ""),
            isImage: message.fileUrls.length > 0,
            fileUrls: message.fileUrls || [],
          },
        ]);
      }

      // Phát sự kiện socket để thông báo ghim mới
      socket.emit("pin-message", {
        from: currentUserId,
        to: selectedUser.id,
        messageId: pendingPinMessage.messageId,
      });

      toast.success("Đã thay thế ghim thành công!");
    } catch (error) {
      console.error("Lỗi khi thay thế ghim:", error);
      toast.error("Không thể thay thế ghim!");
    } finally {
      setShowReplacePinnedModal(false);
      setPendingPinMessage(null);
      setShowMoreMenu(null);
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/messages/deletemsgforme`,
        {
          messageId,
          userId: currentUserId,
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                deletedForMe: true,
                message: "",
                fileUrls: [],
                isImage: false,
                emoji: "",
                reaction: null,
              }
            : msg
        )
      );
      setLastAction("deleteForMe");

      socket.emit("delete-msg-for-me", { messageId, userId: currentUserId });

      toast.success("Đã xóa tin nhắn chỉ ở phía bạn");
      setShowMoreMenu(null);
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
      toast.error("Không thể xóa tin nhắn!");
    }
  };

  const handleMarkMessage = (messageId) => {
    toast.info("Chức năng đánh dấu tin nhắn chưa được triển khai");
    setShowMoreMenu(null);
  };

  const handleSelectMultiple = () => {
    setIsSelectingMultiple(true);
    setShowMoreMenu(null);
  };

  const handleMessageSelect = (messageId) => {
    if (!isSelectingMultiple) return;

    setSelectedMessages(
      (prev) =>
        prev.includes(messageId)
          ? prev.filter((id) => id !== messageId) // Bỏ chọn nếu đã chọn
          : [...prev, messageId] // Thêm vào danh sách nếu chưa chọn
    );
  };
  const handleCancelSelection = () => {
    setIsSelectingMultiple(false);
    setSelectedMessages([]);
  };
  const handleDeleteSelectedMessages = async () => {
    try {
      // Gọi API xóa từng tin nhắn đã chọn
      const deletePromises = selectedMessages.map((messageId) =>
        axios.post(
          `http://localhost:5000/api/messages/deletemsgforme`,
          {
            messageId,
            userId: currentUserId,
          }
        )
      );

      await Promise.all(deletePromises);

      // Cập nhật state messages để phản ánh việc xóa
      setMessages((prev) =>
        prev.map((msg) =>
          selectedMessages.includes(msg._id)
            ? {
                ...msg,
                deletedForMe: true,
                message: "",
                fileUrls: [],
                isImage: false,
                emoji: "",
                reaction: null,
              }
            : msg
        )
      );

      // Phát sự kiện socket để thông báo xóa
      selectedMessages.forEach((messageId) => {
        socket.emit("delete-msg-for-me", { messageId, userId: currentUserId });
      });

      toast.success("Đã xóa các tin nhắn đã chọn!");
      setLastAction("deleteForMe");
      handleCancelSelection(); // Hủy chế độ chọn sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa các tin nhắn:", error);
      toast.error("Không thể xóa các tin nhắn!");
    }
  };

  // Cập nhật hàm handleForwardMessage để hỗ trợ nhiều tin nhắn
  const handleForwardMessage = async () => {
    if (selectedRecipients.length === 0) return;

    if (!Array.isArray(forwardMessageId) || forwardMessageId.length === 0) {
      setShowForwardModal(false);
      setSelectedRecipients([]);
      setForwardMessageId([]);
      return;
    }

    try {
      const validMessages = messages.filter(
        (msg) =>
          forwardMessageId.includes(msg._id) &&
          !msg.recalled &&
          !msg.deletedForMe
      );

      if (validMessages.length === 0) {
        setShowForwardModal(false);
        setSelectedRecipients([]);
        setForwardMessageId([]);
        return;
      }

      const forwardPromises = selectedRecipients.flatMap((recipientId) =>
        forwardMessageId.map((messageId) =>
          axios.post(`http://localhost:5000/api/messages/forwardmsg`, {
            from: currentUserId,
            to: recipientId,
            messageId: messageId,
          })
        )
      );

      const responses = await Promise.all(forwardPromises);

      selectedRecipients.forEach((recipientId, index) => {
        validMessages.forEach((msg, msgIndex) => {
          const responseIndex = index * validMessages.length + msgIndex;
          const responseData = responses[responseIndex]?.data;

          if (!responseData?.message?._id) return;

          socket.emit("send-msg", {
            from: currentUserId,
            to: recipientId,
            message: msg.message,
            createdAt: new Date(),
            isImage: msg.isImage,
            fileUrls: msg.fileUrls || [],
            _id: responseData.message._id,
            forwarded: true,
          });
        });

        moveConversationToTop(recipientId);
      });
    } catch {
      // Bỏ qua lỗi, không log, không toast
    } finally {
      setShowForwardModal(false);
      setSelectedRecipients([]);
      setForwardMessageId([]);
      handleCancelSelection?.();
    }
  };

  const handleViewDetails = (message) => {
    toast.info(
      `Thời gian gửi: ${new Date(message.createdAt).toLocaleString()}`
    );
    setShowMoreMenu(null);
  };

  const handleMoreOptions = (messageId) => {
    console.log("Setting forwardMessageId:", [messageId]);
    setForwardMessageId([messageId]);
    setShowForwardModal(true);
    setShowMoreMenu(null);
  };

  const handleRecipientToggle = (recipientId) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleTyping = () => {
    if (selectedUser) {
      socket.emit("typing", {
        from: currentUserId,
        to: selectedUser.id,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", {
          from: currentUserId,
          to: selectedUser.id,
        });
      }, 3000);
    }
  };

  const handleProfileUpdate = () => {
    fetchUserData(currentUserId);
  };

  const handleIconClick = (icon, messageId) => {
    const message = messages.find((msg) => msg._id === messageId);
    if (icon === "recall") {
      handleRecallMessage(messageId);
    } else if (icon === "reply") {
      setReplyingTo(message);
    } else if (icon === "react") {
      setShowEmojiSelector(messageId);
    } else if (icon === "menu") {
      setShowMoreMenu(messageId);
    }
    setActiveMessage(null);
  };

  const [showCallModal, setShowCallModal] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (currentUserId) {
      socket.emit("add-user", currentUserId);
      fetchUserData(currentUserId);
      fetchConversations();
      fetchFriendRequests();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      setIsTyping(false);
      setTypingUser(null);
    }
  }, [selectedUser]);

  useEffect(() => {
    socket.on("msg-receive", (data) => {
      console.log("Nhận tin nhắn cá nhân:", JSON.stringify(data, null, 2));

      // Kiểm tra loại sự kiện
      if (data.type === "reaction-updated" || data.type === "message-recalled") {
        fetchMessages(selectedUser.id);
      } else {
        // Xử lý các loại tin nhắn khác
        const fromId = data.from?.toString();
        const toId = data.to?.toString();
        const selectedUserId = selectedUser?.id?.toString();

        const isCurrentConversation =
          selectedUserId &&
          (fromId === selectedUserId || toId === selectedUserId);

        const addNewMessage = (prevMessages) => {
          const existingMessage = prevMessages.find(
            (msg) => msg._id === data._id
          );
          if (!existingMessage) {
            const messageText =
              typeof data.message === "object" && data.message !== null
                ? data.message.text || JSON.stringify(data.message)
                : data.message || "";
            const newMessage = {
              fromSelf: fromId === currentUserId,
              message: messageText,
              sender: fromId,
              senderName: data.senderName || "Unknown",
              fileUrls: data.fileUrls || [],
              fileTypes: data.fileTypes || [],
              isImage: data.isImage || false,
              createdAt: data.createdAt || new Date().toISOString(),
              _id: data._id || Date.now().toString(),
              recalled: data.recalled || false,
              reaction: data.reaction || null,
              pinned: data.pinned || false,
              replyTo: data.replyTo || null,
            };
            console.log("Adding new message:", newMessage);
            return [...prevMessages, newMessage];
          }
          console.log("Message already exists:", data._id);
          return prevMessages;
        };

        const userIdToMove = fromId === currentUserId ? toId : fromId;

        let previewMessage =
          typeof data.message === "object" && data.message !== null
            ? data.message.text || JSON.stringify(data.message)
            : data.message || "";
        previewMessage =
          previewMessage.slice(0, 20) +
          (previewMessage.length > 20 ? "..." : "");
        if (data.isImage) {
          previewMessage = "[Hình ảnh]";
        }

        moveConversationToTop(userIdToMove);
        setLastMessages((prev) => ({
          ...prev,
          [userIdToMove]: {
            content: previewMessage,
            fromSelf: fromId === currentUserId,
            createdAt: data.createdAt,
          },
        }));
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id?.toString() === userIdToMove
              ? {
                  ...conv,
                  lastMessage:
                    fromId === currentUserId
                      ? `Bạn: ${previewMessage}`
                      : previewMessage,
                }
              : conv
          )
        );

        if (fromId !== currentUserId && !isCurrentConversation) {
          setUnreadConversations((prev) => ({
            ...prev,
            [userIdToMove]: true,
          }));
          setHasNewMessage(true);
        }

        if (isCurrentConversation) {
          setMessages(addNewMessage);
          setLastAction("newMessage");
        }
      }
    });

    socket.on("receiveFriendRequest", ({ fromUserId }) => {
      if (fromUserId !== currentUserId) {
        fetchFriendRequests();
        toast.info("Bạn có một yêu cầu kết bạn mới!");
      }
    });

    socket.on("recall-message", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                recalled: true,
                message: "",
                fileUrls: [],
                isImage: false,
                reaction: null,
                pinned: false,
              }
            : msg
        )
      );
      setLastAction("recall");
    });

    socket.on("react-message", ({ messageId, reaction }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, reaction } : msg))
      );
      setLastAction("react");
    });

    // Thêm sự kiện pin-message
    socket.on("pin-message", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, pinned: true } : msg
        )
      );
      const messageToPin = messages.find((msg) => msg._id === messageId);
      if (messageToPin) {
        const pinnedMsg = {
          _id: messageToPin._id,
          senderName: messageToPin.fromSelf
            ? user?.fullName || "Bạn"
            : selectedUser?.name || "Unknown",
          content:
            messageToPin.message ||
            (messageToPin.fileUrls.length > 0 ? "[Media]" : ""),
          isImage: messageToPin.fileUrls.length > 0,
          fileUrls: messageToPin.fileUrls || [],
        };
        setPinnedMessages((prev) => [...prev, pinnedMsg]);
      }
      setLastAction("pin");
    });

    // Thêm sự kiện unpin-message
    socket.on("unpin-message", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, pinned: false } : msg
        )
      );
      setPinnedMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      setLastAction("unpin");
    });

    // Thêm sự kiện update-pinned-messages
    socket.on("update-pinned-messages", (data) => {
      setPinnedMessages(data.pinnedMessages);
    });

    socket.on("msg-deleted-for-me", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                deletedForMe: true,
                message: "",
                fileUrls: [],
                isImage: false,
                emoji: "",
                reaction: null,
              }
            : msg
        )
      );
      setLastAction("deleteForMe");
    });

    socket.on("friendAccepted", async ({ from, to }) => {
      console.log("Nhận sự kiện friendAccepted:", { from, to, currentUserId });

      // Kiểm tra xem người dùng hiện tại có liên quan đến sự kiện không
      if (from === currentUserId || to === currentUserId) {
        // Cập nhật danh sách hội thoại
        const updatedConversations = await fetchConversations();

        // Xác định ID của người bạn mới
        const friendId = from === currentUserId ? to : from;
        const newFriend = updatedConversations.find(
          (conv) => conv.id === friendId
        );

        if (!newFriend) {
          console.warn(`Friend with ID ${friendId} not found in conversations`);
          return;
        }

        // Nếu người dùng hiện tại là người gửi lời mời (to === currentUserId)
        if (to === currentUserId) {
          toast.success(
            `${
              newFriend.name || "Người dùng"
            } đã chấp nhận lời mời kết bạn của bạn!`
          );
          // Tùy chọn: Chuyển đến tab Messages và chọn người bạn mới
          setActiveTab("Messages");
          setSelectedUser(newFriend);
          fetchMessages(newFriend.id);
        }
        // Nếu người dùng hiện tại là người chấp nhận (from === currentUserId)
        else if (from === currentUserId) {
          toast.success(
            `Bạn đã trở thành bạn bè với ${newFriend.name || "Người dùng"}!`
          );
        }

        // Cập nhật trạng thái bạn bè
        setConversations(updatedConversations);
        setFilteredConversations(updatedConversations);
        setShowGroupInfoModal(true);
      }
    });

    socket.on("typing", (data) => {
      if (
        selectedUser &&
        data.from === selectedUser.id &&
        data.to === currentUserId
      ) {
        setIsTyping(true);
        setTypingUser(data.from);
      }
    });

    socket.on("stop-typing", (data) => {
      if (
        selectedUser &&
        data.from === selectedUser.id &&
        data.to === currentUserId
      ) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    socket.on("pin-message", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, pinned: true } : msg
        )
      );
      const messageToPin = messages.find((msg) => msg._id === messageId);
      if (messageToPin) {
        setPinnedMessages((prev) => [
          ...prev,
          { ...messageToPin, pinned: true },
        ]);
      }
      setLastAction("pin");
    });

    socket.on("unpin-message", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, pinned: false } : msg
        )
      );
      setPinnedMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      setLastAction("unpin");
    });
    // Thêm listener cho sự kiện groupCreated
    socket.on("groupCreated", (data) => {
      console.log("Nhận groupCreated:", data);

      const newGroup = {
        id: data.groupId,
        name: data.groupName,
        status: "",
        avatar: data.avatar,
        lastMessage: `Nhóm "${data.groupName}" đã được tạo!`,
        type: "group",
      };

      // 更新会话列表
      setConversations((prev) => {
        // 检查群组是否已存在，避免重复
        if (prev.find((conv) => conv.id === data.groupId)) {
          return prev;
        }
        const updatedConversations = [newGroup, ...prev];
        setFilteredConversations((prevFiltered) => {
          if (searchQuery.trim() === "") {
            return updatedConversations;
          } else {
            return updatedConversations.filter((conv) =>
              conv.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
        });
        return updatedConversations;
      });

      // 更新最后消息
      setLastMessages((prev) => ({
        ...prev,
        [data.groupId]: {
          content: `Nhóm "${data.groupName}" đã được tạo!`,
          fromSelf: false,
          createdAt: data.createdAt,
        },
      }));

      // 检查用户是否是群组管理员（创建者）
      if (data.groupAdmin === currentUserId) {
        // 群组创建者：聚焦到新群组
        setSelectedUser(newGroup);
        setIsGroup(true);
        fetchMessages(data.groupId);
        setActiveTab("Messages");
        toast.success(`Nhóm "${data.groupName}" đã được tạo thành công!`);
      } else {
        // 成员：显示被添加到群组的通知
        toast.info(`Bạn đã được thêm vào nhóm "${data.groupName}"!`);
      }
    });

    socket.on(
      "groupMemberRemoved",
      ({ groupId, groupName, removedMemberId }) => {
        let countdown = 5; // Countdown time (5 seconds)
        let countdown1 = 3; // Countdown time for the other user (3 seconds)
        // Initialize SweetAlert2 toast
        const Toast = Swal.mixin({
          toast: true,
          position: "center", // Center the toast on the screen
          showConfirmButton: false,
          timer: 1000, // Update every second
          background: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
          color: "#ffffff", // White text for contrast
          borderRadius: "12px", // Rounded corners
          padding: "1rem", // Comfortable padding
          didOpen: (toast) => {
            toast.style.backdropFilter = "blur(5px)"; // Add blur effect for transparency
            toast.style.border = "1px solid rgba(255, 255, 255, 0.2)"; // Subtle border
          },
        });
        if (selectedUser && selectedUser.id === groupId) {
          const interval = setInterval(() => {
            Toast.fire({
              icon: "info",
              title: `Bạn đã bị xóa khỏi nhóm "${groupName}". Chuyển về trang chủ sau ${countdown} giây.`,
            });

            countdown -= 1;

            if (countdown <= 0) {
              clearInterval(interval); // Stop the interval when countdown ends
              window.location.reload(); // Redirect to homepage
            }
          }, 1000);
        } else {
          const interval = setInterval(() => {
            Toast.fire({
              icon: "info",
              title: `Bạn đã bị xóa khỏi nhóm "${groupName}"`,
            });

            countdown1 -= 1;

            if (countdown1 <= 0) {
              clearInterval(interval); // Stop the interval when countdown ends
            }
          }, 1000);
          fetchConversations(); // Refresh conversations list
        }
      }
    );

    socket.on("group-msg-receive", (data) => {
      console.log("Nhận tin nhắn nhóm:", data);
      if(data.type=== "message-recalled"){
        fetchMessages(selectedUser.id);
      }
      const isCurrentGroup = selectedUser && selectedUser.id === data.groupId;

      if (isCurrentGroup) {
        setMessages((prev) => {
          const existingMessage = prev.find((msg) => msg._id === data._id);

          if (data.type === "poll-updated") {
            // Cập nhật poll đã tồn tại
            console.log("Updating poll:", data.poll);
            return prev.map((msg) =>
              msg._id === data.poll._id && msg.poll
                ? {
                    ...msg,
                    poll: {
                      ...msg.poll,
                      question: data.poll.question,
                      options: data.poll.options,
                      isActive: data.poll.isActive,
                      closed: !data.poll.isActive,
                    },
                  }
                : msg
            );
          }

          if (!existingMessage) {
            if (data.type === "poll-created") {
              // Xử lý tin nhắn poll
              const pollMessage = {
                _id: data._id,
                fromSelf: data.from === currentUserId,
                sender: data.from,
                message: "", // Poll không có message text
                createdAt: data.createdAt,
                poll: {
                  _id: data.poll._id,
                  question: data.poll.question,
                  options: data.poll.options,
                  createdAt: data.createdAt,
                  createdBy: data.from,
                  closed: !data.poll.isActive,
                },
                isPoll: true,
                recalled: false,
                reaction: null,
                pinned: false,
              };
              console.log("Adding poll message:", pollMessage);
              return [...prev, pollMessage];
            } else {
              // Xử lý tin nhắn thông thường
              const messageText =
                typeof data.message === "object" && data.message !== null
                  ? data.message.text || JSON.stringify(data.message)
                  : data.message || "";
              const newMessage = {
                fromSelf: data.from === currentUserId,
                message: messageText,
                sender: data.from,
                senderName: data.senderName || "Unknown",
                fileUrls: data.fileUrls || [],
                fileTypes: data.fileTypes || [],
                isImage: data.isImage || false,
                createdAt: data.createdAt,
                _id: data._id,
                recalled: data.recalled || false,
                reaction: data.reaction || null,
                pinned: data.pinned || false,
                replyTo: data.replyTo || null,
              };
              console.log("Adding regular message:", newMessage);
              return [...prev, newMessage];
            }
          }
          return prev;
        });
        setLastAction("newMessage");
      }

      // Cập nhật danh sách conversation
      moveConversationToTop(data.groupId);

      const previewMessage =
        data.type === "poll-created" || data.type === "poll-updated"
          ? `Cuộc khảo sát: ${data.poll.question}`
          : typeof data.message === "object" && data.message !== null
          ? data.message.text || JSON.stringify(data.message)
          : data.message || "";
      const truncatedPreview =
        previewMessage.slice(0, 20) + (previewMessage.length > 20 ? "..." : "");

      setLastMessages((prev) => ({
        ...prev,
        [data.groupId]: {
          content: truncatedPreview,
          fromSelf: data.from === currentUserId,
          createdAt: data.createdAt,
        },
      }));

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.groupId
            ? {
                ...conv,
                lastMessage: `${
                  data.senderName || "Unknown"
                }: ${truncatedPreview}`,
              }
            : conv
        )
      );

      if (data.from !== currentUserId && !isCurrentGroup) {
        setUnreadConversations((prev) => ({
          ...prev,
          [data.groupId]: true,
        }));
        setHasNewMessage(true);
      }
    });
    socket.on("poll-created", (data) => {
      console.log("Poll created data:", data);
      console.log("Poll object:", data.poll);

      if (selectedUser?.id === data.groupId) {
        setMessages((prev) => {
          const existingMessage = prev.find((msg) => msg._id === data._id);
          if (!existingMessage) {
            const pollMessage = {
              _id: data._id,
              fromSelf: data.from === currentUserId,
              sender: data.from,
              message: "",
              createdAt: data.createdAt,
              poll: {
                _id: data.poll._id,
                question: data.poll.question,
                options: data.poll.options,
                createdAt: data.createdAt,
                createdBy: data.from,
                closed: !data.poll.isActive,
              },
              isPoll: true,
              recalled: false,
              reaction: null,
              pinned: false,
            };
            console.log("Adding poll message from poll-created:", pollMessage);
            return [...prev, pollMessage];
          }
          return prev;
        });
      }

      // Cập nhật conversation list
      moveConversationToTop(data.groupId);
      setLastMessages((prev) => ({
        ...prev,
        [data.groupId]: {
          content: `Cuộc khảo sát: ${data.poll.question}`,
          fromSelf: data.from === currentUserId,
          createdAt: data.createdAt,
        },
      }));

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.groupId
            ? {
                ...conv,
                lastMessage: `${data.senderName || "Unknown"}: Cuộc khảo sát: ${
                  data.poll.question
                }`,
              }
            : conv
        )
      );
    });

    socket.on("poll-updated", (data) => {
      console.log("Poll updated:", data);

      if (selectedUser?.id === data.groupId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.poll && msg.poll._id === data.poll._id
              ? { ...msg, poll: data.poll }
              : msg
          )
        );
      }
    });
    socket.on("pin-message", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, pinned: true } : msg
        )
      );
      const messageToPin = messages.find((msg) => msg._id === messageId);
      if (messageToPin) {
        setPinnedMessages((prev) => [
          ...prev,
          {
            _id: messageToPin._id,
            senderName: messageToPin.fromSelf
              ? user?.fullName || "Bạn"
              : selectedUser?.name || "Unknown",
            content:
              messageToPin.message ||
              (messageToPin.fileUrls.length > 0 ? "[Media]" : ""),
            isImage: messageToPin.fileUrls.length > 0,
            fileUrls: messageToPin.fileUrls || [],
          },
        ]);
      }
      setLastAction("pin");
    });

    socket.on("unpin-message", ({ messageId, reason }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, pinned: false } : msg
        )
      );
      setPinnedMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      setLastAction("unpin");
      if (reason) toast.info(reason);
    });

    socket.on(
      "groupMemberAdded",
      async ({ groupId, groupName, addedMemberId }) => {
        console.log("Nhận memberAdded:", { groupId, groupName, addedMemberId });

        try {
          // Kiểm tra xem nhóm đã tồn tại trong conversations hay chưa
          const existingGroup = conversations.find(
            (conv) => conv.id === groupId
          );

          if (!existingGroup) {
            // Nếu nhóm chưa tồn tại, gọi API để lấy thông tin nhóm
            const groupResponse = await axios.get(
              `http://localhost:5000/api/groups/id/${groupId}`
            );
            const newGroup = {
              id: groupResponse.data._id,
              name: groupResponse.data.groupName || "Unnamed Group",
              avatar: groupResponse.data.avatar || "/default-group-avatar.png",
              members: groupResponse.data.members || [],
              type: "group",
              lastMessage: `Bạn đã được thêm vào nhóm "${groupResponse.data.groupName}"`,
            };

            // Thêm nhóm mới vào conversations và filteredConversations
            setConversations((prev) => [newGroup, ...prev]);
            setFilteredConversations((prev) => [newGroup, ...prev]);

            // Hiển thị thông báo
            toast.info(
              `Bạn đã được thêm vào nhóm "${groupResponse.data.groupName}"!`
            );
          } else {
            // Nếu nhóm đã tồn tại, chỉ cập nhật danh sách thành viên
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === groupId
                  ? {
                      ...conv,
                      members: [...(conv.members || []), addedMemberId],
                    }
                  : conv
              )
            );
            setFilteredConversations((prev) =>
              prev.map((conv) =>
                conv.id === groupId
                  ? {
                      ...conv,
                      members: [...(conv.members || []), addedMemberId],
                    }
                  : conv
              )
            );

            // Nếu nhóm đang được chọn, cập nhật thông tin nhóm và thêm tin nhắn hệ thống
            if (selectedUser?.id === groupId) {
              const memberNames = await Promise.all(
                [addedMemberId].map(async (id) => {
                  const userResponse = await axios.get(
                    `http://localhost:5000/api/users/id/${id}`
                  );
                  return userResponse.data.fullName || "Ẩn danh";
                })
              );
              const systemMessage = {
                _id: `system-${Date.now()}`,
                fromSelf: false,
                sender: "system",
                message: `Đã thêm ${memberNames.join(", ")} vào nhóm`,
                createdAt: new Date(),
                isSystem: true,
              };
              setMessages((prev) => [...prev, systemMessage]);
            }
          }
        } catch (error) {
          console.error("Lỗi khi xử lý groupMemberAdded:", error);
          toast.error("Không thể cập nhật thông tin nhóm!");
        }
      }
    );

    socket.on("groupRenamed", ({ groupId, newName, message }) => {
      console.log("Nhận groupRenamed:", { groupId, newName, message });
      moveConversationToTop(groupId);

      const previewMessage =
        message.slice(0, 35) + (message.length > 35 ? "..." : "");
      setLastMessages((prev) => ({
        ...prev,
        [groupId]: {
          content: previewMessage,
          fromSelf: false,
          createdAt: new Date(),
        },
      }));
      // Cập nhật tên nhóm trong conversations và filteredConversations
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === groupId ? { ...conv, name: newName } : conv
        )
      );
      setFilteredConversations((prev) =>
        prev.map((conv) =>
          conv.id === groupId ? { ...conv, name: newName } : conv
        )
      );

      // Cập nhật selectedUser nếu nhóm đang được chọn
      if (selectedUser?.id === groupId) {
        setSelectedUser((prev) => ({ ...prev, name: newName }));
        setGroupInf((prev) => ({ ...prev, groupName: newName }));

        // Thêm tin nhắn hệ thống
        const systemMessage = {
          _id: `system-${Date.now()}`,
          fromSelf: false,
          sender: "system",
          message: `Nhóm đã được đổi tên thành ${newName}`,
          createdAt: new Date(),
          isSystem: true,
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    });

    socket.on("avatarUpdated", ({ groupId, avatar }) => {
      console.log("Nhận avatarUpdated:", { groupId, avatar });

      // Cập nhật avatar trong conversations và filteredConversations
      setConversations((prev) =>
        prev.map((conv) => (conv.id === groupId ? { ...conv, avatar } : conv))
      );
      setFilteredConversations((prev) =>
        prev.map((conv) => (conv.id === groupId ? { ...conv, avatar } : conv))
      );

      // Cập nhật selectedUser và groupInf nếu nhóm đang được chọn
      if (selectedUser?.id === groupId) {
        setSelectedUser((prev) => ({ ...prev, avatar }));
        setGroupInf((prev) => ({ ...prev, avatar }));

        // Thêm tin nhắn hệ thống
        const systemMessage = {
          _id: `system-${Date.now()}`,
          fromSelf: false,
          sender: "system",
          message: "Avatar nhóm đã được cập nhật",
          createdAt: new Date(),
          isSystem: true,
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    });

    socket.on("groupUpdated", async ({ groupId, groupName, addedMembers }) => {
      console.log("Nhận groupUpdated:", { groupId, groupName, addedMembers });
      fetchConversations(); // Cập nhật lại danh sách conversations
      try {
        //   // Đảm bảo addedMembers là mảng
        //   const memberIds = Array.isArray(addedMembers)
        //     ? addedMembers
        //     : [addedMembers];
        //   // Nếu nhóm đang được chọn, cập nhật groupInf và thêm tin nhắn hệ thống
        //   if (selectedUser?.id === groupId) {
        //     const groupResponse = await axios.get(
        //       `http://localhost:5000/api/groups/id/${groupId}`
        //     );
        //     setGroupInf(groupResponse.data);
        //     const memberNames = await Promise.all(
        //       memberIds.map(async (id) => {
        //         const userResponse = await axios.get(
        //           `http://localhost:5000/api/users/id/${id}`
        //         );
        //         return userResponse.data.fullName || "Ẩn danh";
        //       })
        //     );
        //     const systemMessage = {
        //       _id: `system-${Date.now()}`,
        //       fromSelf: false,
        //       sender: "system",
        //       message: `Đã thêm ${memberNames.join(", ")} vào nhóm`,
        //       createdAt: new Date(),
        //       isSystem: true,
        //     };
        //     setMessages((prev) => [...prev, systemMessage]);
        //   }
        //   // Cập nhật danh sách thành viên trong conversations và filteredConversations
        //   const updateConversations = (prev) =>
        //     prev.map((conv) =>
        //       conv.id === groupId
        //         ? {
        //             ...conv,
        //             members: [...(conv.members || []), ...memberIds],
        //           }
        //         : conv
        //     );
        //   setConversations((prev) => updateConversations(prev));
        //   setFilteredConversations((prev) => updateConversations(prev));
      } catch (error) {
        console.error("Lỗi khi xử lý groupUpdated:", error);
        // Có thể thêm toast thông báo lỗi nếu cần
        // toast.error("Không thể cập nhật thông tin nhóm!");
      }
    });

    socket.on("memberLeft", async ({ groupId, memberId }) => {
      console.log("Nhận memberLeft:", { groupId, memberId });

      // Cập nhật groupInf nếu nhóm đang được chọn
      if (selectedUser?.id === groupId) {
        try {
          const groupResponse = await axios.get(
            `http://localhost:5000/api/groups/id/${groupId}`
          );
          setGroupInf(groupResponse.data);

          // Lấy thông tin thành viên rời nhóm
          const memberResponse = await axios.get(
            `http://localhost:5000/api/users/id/${memberId}`
          );
          const memberName = memberResponse.data.fullName || "Ẩn danh";

          // Thêm tin nhắn hệ thống
          const systemMessage = {
            _id: `system-${Date.now()}`,
            fromSelf: false,
            sender: "system",
            message: `${memberName} đã rời khỏi nhóm`,
            createdAt: new Date(),
            isSystem: true,
          };
          setMessages((prev) => [...prev, systemMessage]);
        } catch (error) {
          console.error("Lỗi khi cập nhật groupInf:", error);
          toast.error("Không thể cập nhật thông tin nhóm!");
        }
      }

      // Cập nhật conversations để loại bỏ thành viên
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === groupId
            ? {
                ...conv,
                members: (conv.members || []).filter((id) => id !== memberId),
              }
            : conv
        )
      );
      setFilteredConversations((prev) =>
        prev.map((conv) =>
          conv.id === groupId
            ? {
                ...conv,
                members: (conv.members || []).filter((id) => id !== memberId),
              }
            : conv
        )
      );
    });
    socket.on("groupDeleted", ({ groupId, groupName }) => {
      // Initialize SweetAlert2 toast
      const Toast = Swal.mixin({
        toast: true,
        position: "center", // Center the toast on the screen
        showConfirmButton: false,
        timer: 3000, // Match the original 3-second display for reload case
        background: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
        color: "#ffffff", // White text for contrast
        borderRadius: "12px", // Rounded corners
        padding: "1rem", // Comfortable padding
        didOpen: (toast) => {
          toast.style.backdropFilter = "blur(5px)"; // Add blur effect for transparency
          toast.style.border = "1px solid rgba(255, 255, 255, 0.2)"; // Subtle border
        },
      });

      if (selectedUser && selectedUser.id === groupId) {
        Toast.fire({
          icon: "info",
          title: `Nhóm "${groupName}" đã bị giải tán. Trang sẽ tải lại sau 3 giây.`,
        });
        setTimeout(() => {
          window.location.reload(); // Redirect to homepage
        }, 3000);
      } else {
        Toast.fire({
          icon: "info",
          title: `Nhóm "${groupName}" đã bị giải tán.`,
        });
        fetchConversations();
      }
    });
    return () => {
      socket.off("msg-receive");
      socket.off("receiveFriendRequest");
      socket.off("recall-message");
      socket.off("react-message");
      socket.off("pin-message");
      socket.off("msg-deleted-for-me");
      socket.off("friendAccepted");
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("pin-message");
      socket.off("unpin-message");
      socket.off("update-pinned-messages");
      socket.off("group-msg-receive");
      socket.off("pin-message");
      socket.off("unpin-message");
      socket.off("groupMemberAdded");
      socket.off("groupRenamed");
      socket.off("avatarUpdated");
      socket.off("memberLeft");
      socket.off("groupCreated");
      socket.off("groupUpdated");
      socket.off("groupDeleted");
      socket.off("groupMemberRemoved");
      socket.off("poll-created");
      socket.off("poll-updated");
    };
  }, [selectedUser, currentUserId]);
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleForwardSelectedMessages = () => {
    if (selectedMessages.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tin nhắn để chuyển tiếp!");
      return;
    }
    setForwardMessageId(selectedMessages); // Lưu danh sách tin nhắn để chuyển tiếp
    setShowForwardModal(true);
    setShowMoreMenu(null);
  };

  const handleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      setNewMessage(event.results[0][0].transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedUser) return;

    const isImage = file.type.startsWith("image/");
    const tempUrl = URL.createObjectURL(file);

    const fileMsg = {
      fromSelf: true,
      message: "",
      createdAt: new Date(),
      recalled: false,
      fileUrls: [tempUrl],
      fileTypes: [file.type], // Lưu kiểu file
      isImage: isImage, // Set isImage nếu là ảnh
      isLoading: true,
      reaction: null,
      pinned: false,
    };

    setMessages((prev) => [...prev, fileMsg]);
    setReplyingTo(null);
    setLastAction("newMessage");

    socket.emit("stop-typing", {
      from: currentUserId,
      to: selectedUser.id,
    });

    try {
      const formData = new FormData();
      formData.append("from", currentUserId);
      formData.append("text", "");
      formData.append("emoji", "");
      formData.append("files", file);

      if (isGroup) {
        formData.append("groupId", selectedUser.id);
      } else {
        formData.append("to", selectedUser.id);
      }

      const response = await axios.post(
        "http://localhost:5000/api/messages/sendmedia",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const serverMessage = response.data.message;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.createdAt === fileMsg.createdAt && msg.fromSelf
            ? {
                ...msg,
                _id: serverMessage._id,
                fileUrls: serverMessage.message.files.map((f) => f.url),
                fileTypes: serverMessage.message.files.map((f) => f.type),
                isImage: isImage,
                isLoading: false,
              }
            : msg
        )
      );

      // Chuẩn bị thông tin cho preview tin nhắn
      const filePreview = isImage
        ? "Đã gửi một hình ảnh"
        : file.type.startsWith("video/")
        ? "Đã gửi một video"
        : file.type.startsWith("audio/")
        ? "Đã gửi một file âm thanh"
        : "Đã gửi một file";

      if (isGroup) {
        socket.emit("group-msg-receive", {
          groupId: selectedUser.id,
          from: currentUserId,
          message: "",
          createdAt: new Date(),
          isImage: isImage,
          fileUrls: serverMessage.message.files.map((f) => f.url),
          fileTypes: serverMessage.message.files.map((f) => f.type),
          _id: serverMessage._id,
          replyTo: replyingTo
            ? {
                _id: replyingTo._id,
                message: replyingTo.message,
                sender: replyingTo.fromSelf ? currentUserId : replyingTo.sender,
              }
            : null,
        });
      } else {
        socket.emit("send-msg", {
          from: currentUserId,
          to: selectedUser.id,
          message: "",
          fileUrls: serverMessage.message.files.map((f) => f.url),
          fileTypes: serverMessage.message.files.map((f) => f.type),
          isImage: isImage,
          createdAt: serverMessage.createdAt,
          _id: serverMessage._id,
          isMedia: true,
        });
      }

      moveConversationToTop(selectedUser.id);

      setLastMessages((prev) => ({
        ...prev,
        [selectedUser.id]: {
          content: filePreview,
          fromSelf: true,
          createdAt: serverMessage.createdAt,
        },
      }));

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedUser.id
            ? { ...conv, lastMessage: `Bạn: ${filePreview}` }
            : conv
        )
      );
    } catch (error) {
      console.error("Lỗi khi gửi file:", error);
      toast.error("Không thể gửi file!");
      setMessages((prev) => prev.filter((msg) => msg !== fileMsg));
    } finally {
      URL.revokeObjectURL(tempUrl);
    }
  };

  useEffect(() => {
    if (lastAction === "newMessage" || lastAction === "fetchMessages") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, lastAction]);

  useEffect(() => {
    if (currentUserId) {
      socket.emit("add-user", currentUserId);
      fetchConversations();
      fetchFriendRequests();
    }
  }, [currentUserId]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    console.log("Selected user:", user);
    setReplyingTo(null);
    setActiveMessage(null);
    setShowEmojiSelector(null);
    setShowMoreMenu(null);
    setActiveTab("messages");
    setUnreadConversations((prev) => {
      const updatedUnread = { ...prev, [user.id]: false };
      const hasUnread = Object.values(updatedUnread).some((unread) => unread);
      setHasNewMessage(hasUnread);
      return updatedUnread;
    });
    fetchMessages(user.id);
  };

  const handleMenuOptionClick = async (option) => {
    if (option === "Đăng xuất") {
      try {
        // Gọi API logout để cập nhật trạng thái offline
        await axios.post(
          "http://localhost:5000/api/users/logout",
          {
            userId: currentUserId,
          }
        );

        // Xóa thông tin người dùng và chuyển hướng
        localStorage.removeItem("userId");
        localStorage.removeItem("phoneNumber");
        setCurrentUserId(null);
        setUserAvatar(null);
        setUser(null);
        window.dispatchEvent(new Event("storageChange"));
        navigate("/login");
      } catch (error) {
        console.error("Lỗi khi đăng xuất:", error);
        toast.error("Không thể đăng xuất! Vui lòng thử lại.");
      }
    } else if (option === "Thoát") {
      console.log("Thoát...");
    } else if (option === "Thông tin tài khoản") {
      setModalProfile(true);
    } else if (option === "Cập nhật tài khoản") {
      setShowChangePasswordModal(true);
    } else if (option === "Thêm bạn bè") {
      setShowSearchModal(true);
    }
    setShowMenu(false);
  };

  const handleMessagesTabClick = () => {
    setActiveTab("messages");
    setSelectedUser(null); // Reset selected user khi quay lại tab Tin nhắn
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserProfile && event.target.classList.contains("bg-overlay")) {
        setShowUserProfile(false);
      }
      if (
        showChangePasswordModal &&
        event.target.classList.contains("bg-overlay")
      ) {
        setShowChangePasswordModal(false);
      }
      if (
        showMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
      if (
        activeMessage &&
        messageActionsRef.current[activeMessage] &&
        !messageActionsRef.current[activeMessage].contains(event.target) &&
        !event.target.closest(".message")
      ) {
        setActiveMessage(null);
      }
      if (
        showEmojiSelector &&
        !event.target.closest(".emoji-selector") &&
        !event.target.closest(".btn-tiny")
      ) {
        setShowEmojiSelector(null);
      }
      if (
        showMoreMenu &&
        !event.target.closest(".more-menu") &&
        !event.target.closest(".btn-tiny")
      ) {
        setShowMoreMenu(null);
      }
      if (showForwardModal && event.target.classList.contains("bg-overlay")) {
        setShowForwardModal(false);
        setSelectedRecipients([]);
        setForwardMessageId([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    showUserProfile,
    showMenu,
    showChangePasswordModal,
    activeMessage,
    showEmojiSelector,
    showMoreMenu,
    showForwardModal,
  ]);

  const shouldWrapText = (content) =>
    typeof content === "string" && content.length > 15;

  const handleShowEmojiSelector = (messageId) => {
    setShowEmojiSelector(messageId);
  };

  const handleHideEmojiSelector = () => {
    setShowEmojiSelector(null);
  };

  //copy tin nhắn
  const handleCopyMessage = (message) => {
    // Kiểm tra nếu tin nhắn bị thu hồi, xóa hoặc không có nội dung văn bản
    if (message.recalled) {
      toast.error("Không thể sao chép tin nhắn đã thu hồi!");
      setShowMoreMenu(null);
      return;
    }
    if (message.deletedForMe) {
      toast.error("Không thể sao chép tin nhắn đã xóa!");
      setShowMoreMenu(null);
      return;
    }
    if (message.isImage || !message.message.trim()) {
      toast.error("Không thể sao chép nội dung này!");
      setShowMoreMenu(null);
      return;
    }

    // Sao chép nội dung tin nhắn vào clipboard
    navigator.clipboard
      .writeText(message.message)
      .then(() => {
        toast.success("Đã sao chép tin nhắn!");
        setShowMoreMenu(null);
      })
      .catch((err) => {
        console.error("Lỗi khi sao chép tin nhắn:", err);
        toast.error("Không thể sao chép tin nhắn!");
        setShowMoreMenu(null);
      });
  };

  useEffect(() => {
    // Khởi tạo audioRef
    audioRef.current = new Audio("/ringtone.mp3");
    audioRef.current.loop = true;

    socket.on("userStatusUpdate", ({ userId, status }) => {
      console.log(`User status updated: User ${userId} is now ${status}`);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === userId
            ? {
                ...conv,
                status: status === "online" ? "Active now" : "Offline",
              }
            : conv
        )
      );

      setFilteredConversations((prev) =>
        prev.map((conv) =>
          conv.id === userId
            ? {
                ...conv,
                status: status === "online" ? "Active now" : "Offline",
              }
            : conv
        )
      );

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => ({
          ...prev,
          status: status === "online" ? "Active now" : "Offline",
        }));
      }
    });

    socket.on("callUser", ({ signal, from, name }) => {
      const callerInfo = {
        name,
        from,
        signal,
        avatar: conversations.find((conv) => conv.id === from)?.avatar,
      };
      setIncomingCall(callerInfo);
      setShowCallModal(true);

      // Luôn phát âm thanh khi có cuộc gọi đến
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((error) => console.error("Failed to play ringtone:", error));
      }
    });

    socket.on("callAccepted", (signal) => {
      if (!calleeInfo) {
        console.error("Callee info is null, cannot proceed to video call");
        return;
      }
      setCallStatus("accepted");
      setShowOutgoingCallModal(false);
      setCalleeInfo(null);
      clearTimeout(callTimeoutRef.current);
      // const roomID = signal || `room_${currentUserId}_${calleeInfo.id}`;
      const fixedRoomID = "room-test-video-call";
      // Mở tab mới cho trang video-call
      window.open(
        `http://localhost:3000/video-call?roomID=${fixedRoomID}&userID=${currentUserId}&toUserID=${calleeInfo.id}`,
        "_blank"
      );
    });

    // Lắng nghe khi cuộc gọi bị từ chối
    socket.on("callRejected", ({ reason }) => {
      toast.error(reason || "Cuộc gọi bị từ chối");
      setCallStatus(null);
      setShowOutgoingCallModal(false);
      setShowCallModal(false);
      setCalleeInfo(null);
      setIncomingCall(null);
      clearTimeout(callTimeoutRef.current);
      navigate("/HomePage");
      stopRingtone();
    });

    socket.on("callFailed", ({ reason }) => {
      toast.error(reason || "Cuộc gọi thất bại");
      setCallStatus(null);
      setShowOutgoingCallModal(false);
      setShowCallModal(false);
      setCalleeInfo(null);
      setIncomingCall(null);
      clearTimeout(callTimeoutRef.current);
      navigate("/HomePage");
      stopRingtone();
    });

    socket.on("callEnded", (data) => {
      console.log("Received callEnded event:", data);
      const isCaller = data.from === currentUserId;
      const isCallee = data.to === currentUserId;
      if (isCaller) {
        setCallStatus(null);
        setShowOutgoingCallModal(false);
        setCalleeInfo(null);
        clearTimeout(callTimeoutRef.current);
        navigate("/HomePage");
      } else if (isCallee) {
        setShowCallModal(false);
        setIncomingCall(null);
        stopRingtone();
      }
    });

    socket.on("callTimeout", () => {
      toast.info("Cuộc gọi hết thời gian, không có phản hồi.");
      setCallStatus(null);
      setShowOutgoingCallModal(false);
      setShowCallModal(false);
      setCalleeInfo(null);
      setIncomingCall(null);
      navigate("/HomePage");
      stopRingtone();
    });

    return () => {
      socket.off("userStatusUpdate");
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callFailed");
      socket.off("callEnded");
      socket.off("callTimeout");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      clearTimeout(callTimeoutRef.current);
    };
  }, [selectedUser, currentUserId, navigate, conversations, calleeInfo]);

  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="chat-app flex">
      <ToastContainer />
      <div className="sidebar " style={{ width: "350px" }}>
        <div className="sidebar-header flex items-center">
          <div
            className="avatar mr-0"
            style={{
              backgroundImage: userAvatar
                ? `url(${userAvatar})`
                : "url(/default-avatar.png)",
            }}
          ></div>
          <h2 className="text-sl font-semibold text-dark flex-1 ml-1">
            {user?.fullName}
          </h2>
          <div className="relative">
            <button
              className="btn btn-small btn-secondary"
              onClick={() => setShowMenu(!showMenu)}
            >
              ✏️
            </button>
            {showMenu && (
              <div
                ref={menuRef}
                className="menu-dropdown absolute top-10 right-0 bg-white shadow-lg rounded-lg w-48 z-20"
              >
                <div
                  className="menu-item flex items-center p-2 hover:bg-gray-100"
                  onClick={() => handleMenuOptionClick("Thông tin tài khoản")}
                >
                  <span className="mr-2">👤</span>
                  <span>Thông tin tài khoản</span>
                </div>
                <div
                  className="menu-item flex items-center p-2 hover:bg-gray-100"
                  onClick={() => handleMenuOptionClick("Cập nhật tài khoản")}
                >
                  <span className="mr-2">❓</span>
                  <span>Cập nhật tài khoản</span>
                </div>
                <div
                  className="menu-item flex items-center p-2 hover:bg-gray-100"
                  onClick={() => handleMenuOptionClick("Thêm bạn bè")}
                >
                  <span className="mr-2">➕</span>
                  <span>Thêm bạn bè</span>
                </div>
                <div
                  className="menu-item flex items-center p-2 hover:bg-gray-100 text-red-500"
                  onClick={() => handleMenuOptionClick("Đăng xuất")}
                >
                  <span className="mr-2">🚪</span>
                  <span>Đăng xuất</span>
                </div>
                <div
                  className="menu-item flex items-center p-2 hover:bg-gray-100 text-red-500"
                  onClick={() => handleMenuOptionClick("Thoát")}
                >
                  <span className="mr-2">❌</span>
                  <span>Thoát</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="tabs flex mb-4 gap-3">
          <div className="relative">
            <div
              className={`tab-icon ${activeTab === "Messages" ? "active" : ""}`}
              onClick={handleMessagesTabClick}
              title="Messages"
            >
              <FaPaperPlane size={24} />
            </div>
            {hasNewMessage && <span className="badge active"></span>}
          </div>
          <div className="relative">
            <div
              className={`tab-icon ${activeTab === "Requests" ? "active" : ""}`}
              onClick={() => handleTabChange("Requests")}
              title="Requests"
            >
              <FaBell size={24} />
            </div>
            {friendRequests?.length > 0 && (
              <span
                className={`badge ${
                  (friendRequests?.length || 0) > 0 ? "active" : ""
                }`}
              >
                {friendRequests.length}
              </span>
            )}
          </div>
          <div className="relative">
            <div
              className={`tab-icon ${activeTab === "Contacts" ? "active" : ""}`}
              onClick={() => handleTabChange("Contacts")}
              title="Contacts"
            >
              <FaAddressBook size={24} />
            </div>
          </div>
        </div>
        <div className="search-bar">
          <span className="icon icon-search"></span>
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span
            className="icon icon-add-friend"
            onClick={() => setShowSearchModal(true)}
          ></span>
          <span
            className="icon icon-group"
            onClick={() => setShowAddGroupModal(true)}
          ></span>
        </div>
        {activeTab === "Contacts" ? (
          <div className="contacts-options">
            <button
              className={`contacts-tab-btn ${
                contactsTab === "friends" ? "active" : ""
              }`}
              onClick={() => handleContactsTabChange("friends")}
            >
              Danh sách bạn bè
            </button>
            <button
              className={`contacts-tab-btn ${
                contactsTab === "groups" ? "active" : ""
              }`}
              onClick={() => handleContactsTabChange("groups")}
            >
              Danh sách nhóm
            </button>
          </div>
        ) : activeTab === "Requests" ? (
          <div className="request-list">
            {friendRequests.length > 0 ? (
              friendRequests.map(({ friendInfo }) => (
                <div
                  key={friendInfo._id}
                  className="request-item flex items-center mb-4 p-2 hover:bg-gray-100"
                >
                  <div
                    className="avatar mr-4"
                    style={{
                      backgroundImage: `url(${
                        friendInfo.avatar || "/default-avatar.png"
                      })`,
                      width: "40px",
                      height: "40px",
                      backgroundSize: "cover",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <div className="flex-col flex-1">
                    <span className="text-sm font-semibold text-dark">
                      {friendInfo.fullName || friendInfo.phoneNumber}
                    </span>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="btn btn-small btn-primary"
                        onClick={() => handleAcceptFriend(friendInfo._id)}
                      >
                        Đồng ý
                      </button>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleRejectFriend(friendInfo._id)}
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">
                Không có yêu cầu kết bạn
              </p>
            )}
          </div>
        ) : (
          <div className="conversation-list">
            {filteredConversations.map((conv) => {
              const lastMessageData = lastMessages[conv.id];
              let displayMessage = conv.status;

              if (lastMessageData) {
                if (lastMessageData.fromSelf) {
                  displayMessage = `Bạn: ${lastMessageData.content}`;
                } else {
                  displayMessage = lastMessageData.content;
                }
              }

              const isBirthday = birthdayUsers.some(
                (user) => user.id === conv.id
              );

              return (
                <div
                  key={conv.id}
                  className={`conversation-item flex items-center mb-44 ${
                    selectedUser?.id === conv.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectUser(conv)}
                >
                  <div className="relative">
                    <div
                      className="avatar mr-4"
                      style={{
                        backgroundImage: `url(${conv.avatar})`,
                        width: "40px",
                        height: "40px",
                        backgroundSize: "cover",
                        borderRadius: "50%",
                      }}
                    ></div>
                    {conv.status === "Active now" && (
                      <span className="status-indicator"></span>
                    )}
                  </div>
                  <div className="flex-col flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-dark">
                        {conv.name}
                        {isBirthday && (
                          <span
                            className="birthday-icon ml-2"
                            title="Hôm nay là sinh nhật!"
                          >
                            🎉
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={`text-xs ${
                          unreadConversations[conv.id]
                            ? "font-bold text-black"
                            : "text-gray"
                        }`}
                      >
                        {displayMessage}
                      </span>
                      <span className="text-xs text-gray">
                        {conv.time || ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="chat-main flex-col">
        {selectedUser ? (
          <>
            <div className="chat-header flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="avatar mr-4"
                  style={{
                    backgroundImage: `url(${
                      selectedUser.avatar || "/default-avatar.png"
                    })`,
                    width: "40px",
                    height: "40px",
                    backgroundSize: "cover",
                    borderRadius: "50%",
                  }}
                  onClick={handleShowGroupInfo}
                ></div>
                <div>
                  <h2 className="text-sl font-semibold text-dark">
                    {selectedUser.name}
                  </h2>
                  <span className="text-xs text-gray">
                    {selectedUser.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => startCall(selectedUser.id)}
                  disabled={selectedUser.status !== "Active now" || callStatus}
                >
                  📞
                </button>
                <button
                  className="btn btn-small btn-secondary"
                  onClick={handleShowGroupInfo}
                >
                  ℹ️
                </button>
              </div>
            </div>
            <div
              className="chat-messages"
              onMouseLeave={handleHideEmojiSelector}
            >
              {pinnedMessages &&
                Array.isArray(pinnedMessages) &&
                pinnedMessages.length > 0 && (
                  <div className="pinned-message-bar">
                    {isPinnedBarCollapsed || pinnedMessages.length === 1 ? (
                      (() => {
                        const latest =
                          pinnedMessages[pinnedMessages.length - 1];
                        return (
                          <div
                            className="pinned-message-item"
                            onClick={() => scrollToMessage(latest._id)}
                          >
                            <div className="pinned-message-content">
                              <span className="message-icon">💬</span>
                              <span className="pinned-message-sender">
                                {latest.senderName}:
                              </span>
                              {latest.isImage && latest.fileUrls.length > 0 ? (
                                <img
                                  src={latest.fileUrls[0]}
                                  alt="Pinned Media"
                                  className="pinned-message-media"
                                />
                              ) : (
                                <span className="pinned-message-text">
                                  {latest.content}
                                </span>
                              )}
                            </div>
                            <div className="pinned-message-actions">
                              {pinnedMessages.length > 1 ? (
                                <button
                                  className="pinned-message-toggle"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPinnedBarCollapsed(
                                      !isPinnedBarCollapsed
                                    );
                                  }}
                                >
                                  +{pinnedMessages.length - 1} ghim
                                </button>
                              ) : (
                                <button
                                  className="pinned-message-unpin"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnpinMessage(latest._id);
                                  }}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="pinned-message-header">
                        <span>Danh sách ghim ({pinnedMessages.length})</span>
                        <button
                          className="pinned-message-toggle"
                          onClick={() =>
                            setIsPinnedBarCollapsed(!isPinnedBarCollapsed)
                          }
                        >
                          Thu gọn
                        </button>
                      </div>
                    )}
                    {!isPinnedBarCollapsed && pinnedMessages.length > 1 && (
                      <div
                        id="pinned-message-list"
                        className="pinned-message-list"
                      >
                        {pinnedMessages.map((pinned) => (
                          <div
                            key={pinned._id}
                            className="pinned-message-item"
                            onClick={() => scrollToMessage(pinned._id)}
                          >
                            <div className="pinned-message-content">
                              <span className="message-icon">💬</span>
                              <span className="pinned-message-sender">
                                {pinned.senderName}:
                              </span>
                              {pinned.isImage && pinned.fileUrls.length > 0 ? (
                                <img
                                  src={pinned.fileUrls[0]}
                                  alt="Pinned Media"
                                  className="pinned-message-media"
                                />
                              ) : (
                                <span className="pinned-message-text">
                                  {pinned.content}
                                </span>
                              )}
                            </div>
                            <button
                              className="pinned-message-unpin"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnpinMessage(pinned._id);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {messages.map((msg, index) => (
                <React.Fragment key={msg._id || index}>
                  {(index === 0 ||
                    new Date(
                      messages[index - 1].createdAt
                    ).toLocaleDateString() !==
                      new Date(msg.createdAt).toLocaleDateString()) && (
                    <div className="chat-date-divider">
                      <span>
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {msg.sender === SYSTEM_USER_ID ? (
                    // System message styled like chat-date-divider
                    <div className="chat-date-divider system-message">
                      <span>
                        {msg.message}
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#777",
                            marginTop: "4px",
                          }}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </span>
                    </div>
                  ) : msg.poll ? (
                    // Poll message - PHẦN ĐƯỢC THÊM VÀO
                    <div className="chat-message poll-message-container">
                      <PollMessage
                        poll={msg.poll}
                        currentUserId={currentUserId}
                        onVoteUpdate={(updatedPoll) => {
                          setMessages((prev) =>
                            prev.map((m) =>
                              m._id === msg._id
                                ? { ...m, poll: updatedPoll }
                                : m
                            )
                          );
                        }}
                      />
                      <div className="message-time text-xs text-gray-500 mt-1">
                        {formatMessageTime(msg.createdAt)}
                      </div>
                    </div>
                  ) : (
                    // Regular messages
                    <div
                      className={`chat-message relative ${
                        msg.fromSelf ? "self-end" : "self-start"
                      } ${
                        selectedMessages.includes(msg._id)
                          ? "selected-message"
                          : ""
                      }`}
                      ref={(el) => (messageRefs.current[msg._id] = el)}
                      onMouseEnter={() => setActiveMessage(msg._id || index)}
                      onMouseLeave={(e) => {
                        if (
                          messageActionsRef.current[msg._id || index]?.contains(
                            e.relatedTarget
                          )
                        ) {
                          return;
                        }
                        setActiveMessage(null);
                      }}
                      onClick={() => handleMessageSelect(msg._id)}
                    >
                      {!msg.fromSelf ? (
                        // Other users' messages
                        <div className="flex items-center gap-2">
                          <div
                            className="avatar"
                            style={{
                              backgroundImage: isGroup
                                ? `url(${
                                    avatarMap[msg.sender] ||
                                    "/default-avatar.png"
                                  })`
                                : `url(${selectedUser.avatar})`,
                              width: "30px",
                              height: "30px",
                              backgroundSize: "cover",
                              borderRadius: "50%",
                              cursor: "pointer",
                            }}
                            onClick={() => handleShowProfile1(msg.sender)}
                          ></div>
                          <div className="flex flex-col">
                            {msg.replyTo && (
                              <div className="reply-preview-box">
                                <p className="reply-to-text">
                                  {msg.fromSelf
                                    ? "You replied to yourself"
                                    : `You replied to ${selectedUser.name}`}
                                </p>
                                <div
                                  className={`replied-message ${
                                    shouldWrapText(msg.replyTo.content)
                                      ? "wrap-text"
                                      : "no-wrap"
                                  }`}
                                >
                                  {msg.replyTo.content}
                                </div>
                              </div>
                            )}
                            {msg.fileUrls?.length > 0 &&
                            !msg.recalled &&
                            !msg.deletedForMe ? (
                              <div
                                className={`message-image-box ${
                                  msg.fromSelf
                                    ? "message-image-box-me"
                                    : "message-image-box-other"
                                }`}
                              >
                                {msg.isLoading ? (
                                  <div className="spinner">Đang tải...</div>
                                ) : (
                                  msg.fileUrls.map((url, idx) => {
                                    const fileType =
                                      msg.fileTypes && msg.fileTypes[idx]
                                        ? msg.fileTypes[idx]
                                        : "";
                                    return fileType.startsWith("image/") ? (
                                      <img
                                        key={idx}
                                        src={url}
                                        alt="Uploaded"
                                        className="message-image"
                                        onError={(e) => {
                                          e.target.src = "/fallback-image.png";
                                        }}
                                        onClick={() => handleImageClick(url)}
                                      />
                                    ) : (
                                      <FileViewer
                                        key={idx}
                                        file={{ url, type: fileType }}
                                        onClick={() => {
                                          if (fileType.startsWith("image/")) {
                                            handleImageClick(url);
                                          }
                                        }}
                                      />
                                    );
                                  })
                                )}
                              </div>
                            ) : (
                              <div
                                className={`message-body ${
                                  msg.fromSelf
                                    ? "message-body-me"
                                    : "message-body-other"
                                }`}
                              >
                                <p>
                                  {msg.recalled
                                    ? "Tin nhắn đã bị thu hồi"
                                    : msg.deletedForMe
                                    ? "Tin nhắn đã bị xóa"
                                    : `${msg.message}${msg.emoji || ""}`}
                                </p>
                              </div>
                            )}
                            {msg.reaction &&
                              !msg.recalled &&
                              !msg.deletedForMe && (
                                <div
                                  className={`reaction ${
                                    msg.fromSelf ? "self-end" : "self-start"
                                  } ${msg.reaction.flyIn ? "fly-in" : ""}`}
                                >
                                  <span>{msg.reaction.emoji}</span>
                                </div>
                              )}
                            <div
                              className={`message-time text-xs text-gray-500 mt-1 ${
                                msg.fromSelf ? "self-end" : "self-start"
                              }`}
                            >
                              {formatMessageTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Your own messages
                        <>
                          {msg.replyTo && (
                            <div className="reply-preview-box">
                              <p className="reply-to-text">
                                {msg.fromSelf
                                  ? "You replied to yourself"
                                  : `You replied to ${selectedUser.name}`}
                              </p>
                              <div
                                className={`replied-message ${
                                  shouldWrapText(msg.replyTo.content)
                                    ? "wrap-text"
                                    : "no-wrap"
                                }`}
                              >
                                {msg.replyTo.content}
                              </div>
                            </div>
                          )}
                          {msg.fileUrls?.length > 0 &&
                          !msg.recalled &&
                          !msg.deletedForMe ? (
                            <div
                              className={`message-file-box ${
                                msg.fromSelf
                                  ? "message-file-box-me"
                                  : "message-file-box-other"
                              }`}
                            >
                              {msg.isLoading ? (
                                <div className="spinner">Đang tải...</div>
                              ) : (
                                msg.fileUrls.map((url, idx) => {
                                  const fileType =
                                    msg.fileTypes && msg.fileTypes[idx]
                                      ? msg.fileTypes[idx]
                                      : "";
                                  return (
                                    <FileViewer
                                      key={idx}
                                      file={{ url, type: fileType }}
                                      onClick={() => {
                                        if (fileType.startsWith("image/")) {
                                          handleImageClick(url);
                                        }
                                      }}
                                    />
                                  );
                                })
                              )}
                            </div>
                          ) : (
                            <div
                              className={`message-body ${
                                msg.fromSelf
                                  ? "message-body-me"
                                  : "message-body-other"
                              }`}
                            >
                              <p>
                                {msg.recalled
                                  ? "Tin nhắn đã bị thu hồi"
                                  : msg.deletedForMe
                                  ? "Tin nhắn đã bị xóa"
                                  : `${msg.message}${msg.emoji || ""}`}
                              </p>
                            </div>
                          )}
                          {msg.reaction &&
                            !msg.recalled &&
                            !msg.deletedForMe && (
                              <div
                                className={`reaction ${
                                  msg.fromSelf ? "self-end" : "self-start"
                                } ${msg.reaction.flyIn ? "fly-in" : ""}`}
                              >
                                <span>{msg.reaction.emoji}</span>
                              </div>
                            )}
                          <div
                            className={`message-time text-xs text-gray-500 mt-1 ${
                              msg.fromSelf ? "self-end" : "self-start"
                            }`}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </div>
                        </>
                      )}
                      {activeMessage === (msg._id || index) && (
                        <div
                          className={`message-actions-bar ${
                            msg.fromSelf ? "actions-right" : "actions-left"
                          }`}
                          ref={(el) =>
                            (messageActionsRef.current[msg._id || index] = el)
                          }
                        >
                          {msg.fromSelf &&
                            !msg.recalled &&
                            !msg.deletedForMe && (
                              <button
                                className="btn-tiny"
                                onClick={() =>
                                  handleIconClick("recall", msg._id || index)
                                }
                                title="Thu hồi"
                              >
                                🗑️
                              </button>
                            )}
                          <button
                            className="btn-tiny"
                            onClick={() =>
                              handleIconClick("reply", msg._id || index)
                            }
                            title="Reply"
                          >
                            ↩️
                          </button>
                          <button
                            className="btn-tiny"
                            onClick={() =>
                              handleIconClick("react", msg._id || index)
                            }
                            title="React"
                          >
                            😊
                          </button>
                          <button
                            className="btn-tiny"
                            onClick={() =>
                              handleIconClick("menu", msg._id || index)
                            }
                            title="More"
                          >
                            ⋮
                          </button>
                        </div>
                      )}
                      {showEmojiSelector === (msg._id || index) && (
                        <div
                          className={`emoji-selector absolute ${
                            msg.fromSelf ? "right-0" : "left-0"
                          } bg-white shadow-md rounded-lg p-2 flex gap-1 z-20`}
                          onMouseLeave={handleHideEmojiSelector}
                        >
                          {emojiOptions.map((emoji, idx) => (
                            <button
                              key={idx}
                              className="emoji-button text-base hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
                              onClick={() => handleReactMessage(msg._id, emoji)}
                              aria-label={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                      {showMoreMenu === (msg._id || index) && (
                        <div
                          className={`more-menu absolute bg-white shadow-lg rounded-lg w-48 z-20 top-50 translate-y-65 ${
                            msg.fromSelf ? "right-full mr-0" : "left-full ml-0"
                          }`}
                        >
                          <div
                            className="menu-item flex items-center p-2 hover:bg-gray-100"
                            onClick={() => handleCopyMessage(msg)}
                          >
                            <span className="mr-2">📋</span>
                            <span>Copy tin nhắn</span>
                          </div>
                          <div
                            className="menu-item flex items-center p-2 hover:bg-gray-100"
                            onClick={() => handlePinMessage(msg._id)}
                          >
                            <span className="mr-2">📌</span>
                            <span>Ghim tin nhắn</span>
                          </div>
                          <div
                            className="menu-item flex items-center p-2 hover:bg-gray-100"
                            onClick={() => handleSelectMultiple()}
                          >
                            <span className="mr-2">📑</span>
                            <span>Chọn nhiều tin nhắn</span>
                          </div>
                          <div
                            className="menu-item flex items-center p-2 hover:bg-gray-100"
                            onClick={() => handleMoreOptions(msg._id)}
                          >
                            <span className="mr-2">➡️</span>
                            <span>Chuyển tiếp tin nhắn</span>
                          </div>
                          <div
                            className="menu-item flex items-center p-2 hover:bg-gray-100 text-red-500"
                            onClick={() => handleDeleteForMe(msg._id)}
                          >
                            <span className="mr-2">🗑️</span>
                            <span>Xóa tin nhắn</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))}

              {isTyping && typingUser === selectedUser?.id && (
                <div className="chat-typing-indicator">
                  <span>{selectedUser.name} is typing</span>
                  <span className="wave-animation">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {isSelectingMultiple && (
              <div className="selection-action-bar flex items-center justify-between p-2 bg-gray-100 border-t border-b border-gray-300">
                <span className="text-sm font-semibold">
                  Đã chọn: {selectedMessages.length}
                </span>
                <div className="flex gap-2">
                  <button
                    className="selection-action-btn forward"
                    onClick={handleForwardSelectedMessages}
                    title="Chuyển tiếp"
                  >
                    <span>Chuyển tiếp</span>
                  </button>
                  <button
                    className="selection-action-btn delete"
                    onClick={handleDeleteSelectedMessages}
                    title="Xóa"
                  >
                    <span>Xóa</span>
                  </button>
                  <button
                    className="selection-action-btn cancel"
                    onClick={handleCancelSelection}
                    title="Hủy"
                  >
                    <span>Hủy</span>
                  </button>
                </div>
              </div>
            )}

            {replyingTo && (
              <div className="replying-to flex items-center justify-between p-2 bg-gray-100 border-t border-b border-gray-300">
                <div>
                  <p className="text-xs text-gray-500">
                    Đang trả lời{" "}
                    {replyingTo.fromSelf ? "chính bạn" : selectedUser.name}
                  </p>
                  <p className="text-sm">{replyingTo.message}</p>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setReplyingTo(null)}
                >
                  ✕
                </button>
              </div>
            )}
            <div className="chat-input flex-col relative">
              {replyingTo && (
                <div className="replying-to flex items-center justify-between p-2 bg-gray-100 border-t border-b border-gray-300">
                  <div>
                    <p className="text-xs text-gray-500">
                      Đang trả lời{" "}
                      {replyingTo.fromSelf ? "chính bạn" : selectedUser.name}
                    </p>
                    <p className="text-sm">{replyingTo.message}</p>
                  </div>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setReplyingTo(null)}
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center">
                <button
                  className="btn-icon btn-small btn-secondary1 mr-2"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😊
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Tin nhắn..."
                  className="input flex-1 no-border"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />

                {newMessage.trim() ? (
                  <button
                    className="iconSend"
                    onClick={handleSendMessage}
                    title="Gửi"
                  >
                    <FaPaperPlane size={22} color="#007bff" />
                  </button>
                ) : (
                  <>
                    <label className="btn-icon btn-small btn-secondary1 mr-2">
                      🖼️
                      <input
                        type="file"
                        accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-rar-compressed"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                    <button
                      className={`btn-icon btn-small btn-secondary1 mr-2 ${
                        isRecording ? "recording" : ""
                      }`}
                      onClick={handleSpeechRecognition}
                    >
                      🎙️
                    </button>
                    <button
                      className="btn-icon btn-small btn-secondary1 mr-2"
                      onClick={() => setShowGifPicker(!showGifPicker)}
                    >
                      🎞️
                    </button>
                    <button
                      className="btn-icon btn-small btn-secondary1"
                      onClick={handleSendHeart}
                    >
                      ❤️
                    </button>
                    {selectedUser &&
                      birthdayUsers.some(
                        (user) => user.id === selectedUser.id
                      ) && (
                        <button
                          className="btn btn-small btn-primary ml-2"
                          onClick={() => handleSendBirthdayWish(selectedUser)}
                        >
                          Gửi lời chúc mừng sinh nhật 🎂
                        </button>
                      )}
                  </>
                )}
              </div>
              {showEmojiPicker && (
                <div className="emoji-picker absolute bottom-16 left-2 z-10">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}

              {showGifPicker && (
                <div className="gif-picker absolute bottom-16 right-2 bg-white shadow-lg rounded-lg p-4 z-10 max-h-80 overflow-y-auto">
                  <div className="gif-grid grid grid-cols-2 gap-2">
                    {gifs.length > 0 ? (
                      gifs.map((gif) => (
                        <Gif
                          key={gif.id}
                          gif={gif}
                          width={100}
                          onGifClick={(gif, e) => {
                            e.preventDefault();
                            handleSendGif(gif);
                          }}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Đang tải GIF...</p>
                    )}
                  </div>
                  <button
                    className="btn btn-small btn-secondary mt-2 w-full"
                    onClick={() => setShowGifPicker(false)}
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </>
        ) : contactsTab ? (
          <ContactsPage
            initialTab={contactsTab}
            onSelectItems={handleSelectItems}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              Chọn một người dùng để bắt đầu trò chuyện
            </p>
          </div>
        )}
      </div>
      {showGroupInfoModal && (
        <GroupInfoPanel
          isOpen={showGroupInfoModal}
          onClose={() => setShowGroupInfoModal(false)}
          groupInfo={selectedUser}
          currentUserId={currentUserId}
          isGroup={isGroup}
          socket={socket}
        />
      )}
      {showUserProfile && profileUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-overlay z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {!isGroup ? "Thông Tin Người Dùng" : "Thông Tin Thành Viên"}
              </h2>
              <button
                onClick={() => {
                  setShowUserProfile(false);
                  setProfileUser(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="avatar mb-4"
                style={{
                  backgroundImage: `url(${
                    profileUser.avatar || "/default-avatar.png"
                  })`,
                  width: "80px",
                  height: "80px",
                  backgroundSize: "cover",
                  borderRadius: "50%",
                }}
              ></div>
              <h3 className="text-lg font-semibold mb-4">
                {profileUser.fullName}
              </h3>
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    Số điện thoại:
                  </span>
                  <span className="text-gray-600">
                    {profileUser.phoneNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Trạng thái:</span>
                  <span className="text-gray-600">{profileUser.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Ngày sinh:</span>
                  <span className="text-gray-600">{profileUser.birthday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Giới tính:</span>
                  <span className="text-gray-600">{profileUser.gender}</span>
                </div>
              </div>
            </div>
            {isGroup ? (
              groupInf.groupAdmin === currentUserId ? (
                <button
                  className="btn btn-small btn-primary mt-4 w-full"
                  onClick={() => {
                    handleUnGroup(profileUser._id);
                  }}
                >
                  Xóa khỏi nhóm
                </button>
              ) : null // Nếu không phải admin, không hiển thị nút
            ) : (
              <button
                className="btn btn-small btn-primary mt-4 w-full"
                onClick={() => {
                  handleUnfriend(profileUser._id);
                }}
              >
                Xóa bạn
              </button>
            )}
          </div>
        </div>
      )}

      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
      {modalProfile && (
        <div ref={modalRef}>
          <UserProfilePage
            onClose={() => setModalProfile(false)}
            user={user}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      )}
      {showSearchModal && (
        <SearchModal onClose={() => setShowSearchModal(false)} />
      )}
      {showForwardModal && (
        <div className="fwd-modal-overlay">
          <div className="fwd-modal-container">
            <div className="fwd-modal-header">
              <h2 className="fwd-modal-title">Chuyển tiếp tin nhắn</h2>
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setSelectedRecipients([]);
                  setForwardMessageId([]);
                }}
                className="fwd-modal-close-btn"
              >
                ✕
              </button>
            </div>
            {/* Phần xem trước tin nhắn */}
            <div className="fwd-message-preview">
              <h3 className="fwd-preview-title">Tin nhắn được chuyển tiếp:</h3>
              {Array.isArray(forwardMessageId) &&
              forwardMessageId.length > 0 ? (
                forwardMessageId.map((msgId) => {
                  const msg = messages.find((m) => m._id === msgId);
                  return msg ? (
                    <div key={msg._id} className="fwd-message-item">
                      {msg.isImage && msg.fileUrls.length > 0 ? (
                        <img
                          src={msg.fileUrls[0]}
                          alt="Forwarded Media"
                          className="fwd-message-image"
                        />
                      ) : (
                        <p className="fwd-message-text">
                          {msg.message || "[Không có nội dung văn bản]"}
                        </p>
                      )}
                    </div>
                  ) : null;
                })
              ) : (
                <p className="fwd-no-message">Không có tin nhắn được chọn</p>
              )}
            </div>
            {/* Danh sách người nhận */}
            <div className="fwd-recipient-list">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div key={conv.id} className="fwd-recipient-item">
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(conv.id)}
                      onChange={() => handleRecipientToggle(conv.id)}
                      className="fwd-recipient-checkbox"
                    />
                    <div
                      className="fwd-recipient-avatar"
                      style={{
                        backgroundImage: `url(${
                          conv.avatar || "/default-avatar.png"
                        })`,
                        backgroundSize: "cover",
                        borderRadius: "50%",
                      }}
                    ></div>
                    <div className="fwd-recipient-info">
                      <span className="fwd-recipient-name">{conv.name}</span>
                      <span className="fwd-recipient-status">
                        {conv.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="fwd-no-recipients">
                  Không có bạn bè nào để chuyển tiếp
                </p>
              )}
            </div>
            <div className="fwd-modal-footer">
              <button
                className="fwd-btn fwd-btn-secondary"
                onClick={() => {
                  setShowForwardModal(false);
                  setSelectedRecipients([]);
                  setForwardMessageId([]);
                }}
              >
                Hủy
              </button>
              <button
                className="fwd-btn fwd-btn-primary"
                onClick={handleForwardMessage}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal tạo nhóm */}
      <AddGroupModal
        isOpen={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        currentUserId={currentUserId}
      />
      {/* Modal cho người nhận */}
      <IncomingCallModal
        isOpen={showCallModal}
        caller={incomingCall}
        onAccept={() => {
          // const roomID =
          //   incomingCall.signal || `room_${incomingCall.from}_${currentUserId}`;
          const fixedRoomID = "room-test-video-call";

          setCallStatus("accepted");
          socket.emit("answerCall", {
            to: incomingCall.from,
            signal: fixedRoomID,
          });
          // Mở tab mới cho trang video-call
          window.open(
            `http://localhost:3000/video-call?roomID=${fixedRoomID}&userID=${currentUserId}&toUserID=${incomingCall.from}`,
            "_blank"
          );
          stopRingtone();
          setShowCallModal(false);
          setIncomingCall(null);
        }}
        onReject={() => {
          socket.emit("rejectCall", {
            to: incomingCall.from,
            reason: "Người nhận từ chối cuộc gọi",
          });
          stopRingtone();
          setShowCallModal(false);
          setIncomingCall(null);
        }}
      />
      {/* Modal cho người gọi */}
      <OutgoingCallModal
        isOpen={showOutgoingCallModal}
        callee={calleeInfo}
        onCancel={() => {
          clearTimeout(callTimeoutRef.current);
          setShowOutgoingCallModal(false);
          setCalleeInfo(null);
          setCallStatus(null);
          navigate("/HomePage"); // Chuyển hướng về trang HomePage
        }}
        socket={socket} // Đảm bảo dòng này có mặt
        currentUserId={currentUserId}
      />
      {/* Modal xem ảnh lớn */}
      <ImageViewerModal
        isOpen={viewerModalOpen}
        onClose={() => setViewerModalOpen(false)}
        imageUrl={selectedImage}
        allImages={allImages}
      />
      <ReplacePinnedMessageModal
        show={showReplacePinnedModal}
        onClose={() => {
          setShowReplacePinnedModal(false);
          setPendingPinMessage(null);
        }}
        onConfirm={handleReplacePinnedMessage}
        messageContent={
          pinnedMessages.length > 0
            ? pinnedMessages[0].content
            : "Không có nội dung"
        }
      />
      <CreatePollModal
        isOpen={showCreatePollModal}
        onClose={() => setShowCreatePollModal(false)}
        userId={currentUserId}
        groupId={selectedUser?.type === "group" ? selectedUser.id : null}
        onPollCreated={(pollData) => {
          if (!pollData || !pollData._id || !pollData.poll) {
            toast.error("Dữ liệu khảo sát không hợp lệ!");
            return;
          }

          // Thêm khảo sát vào messages nếu đang ở đúng group
          if (
            selectedUser?.id === pollData.groupId &&
            selectedUser?.type === "group"
          ) {
            const pollMessage = {
              _id: pollData._id,
              fromSelf: true,
              sender: currentUserId,
              message: "",
              createdAt: pollData.createdAt || new Date().toISOString(),
              poll: {
                _id: pollData.poll._id,
                question: pollData.poll.question,
                options: pollData.poll.options || [],
                createdAt: pollData.createdAt || new Date().toISOString(),
                createdBy: currentUserId,
                closed: pollData.poll.closed || false,
              },
              isPoll: true,
              recalled: false,
              reaction: null,
              pinned: false,
            };

            setMessages((prev) => {
              // Kiểm tra xem tin nhắn đã tồn tại chưa để tránh trùng lặp
              if (!prev.some((msg) => msg._id === pollMessage._id)) {
                return [...prev, pollMessage];
              }
              return prev;
            });

            setLastAction("newMessage");
          }

          // Cập nhật conversations và lastMessages
          moveConversationToTop(pollData.groupId);
          setLastMessages((prev) => ({
            ...prev,
            [pollData.groupId]: {
              content: `Cuộc khảo sát: ${pollData.poll.question}`,
              fromSelf: true,
              createdAt: pollData.createdAt || new Date().toISOString(),
            },
          }));
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === pollData.groupId
                ? {
                    ...conv,
                    lastMessage: `Bạn: Cuộc khảo sát: ${pollData.poll.question}`,
                    lastMessageTime:
                      pollData.createdAt || new Date().toISOString(),
                  }
                : conv
            )
          );
        }}
      />
    </div>
  );
};

export default HomePage;
