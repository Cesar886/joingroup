import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

export default function HowToCreateTelegramGroup() {
  useEffect(() => {
    document.title = 'How to Create a Telegram Group';
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Helmet>
        <title>How to Create a Telegram Group – Step-by-Step Guide</title>
        <meta
          name="description"
          content="Learn how to create a Telegram group easily. Step-by-step guide for beginners: from setup to inviting members and managing group settings."
        />
        <meta name="keywords" content="create Telegram group, Telegram community, Telegram group admin, Telegram group settings, Telegram tutorial" />
        <link rel="canonical" href="https://joingroups.pro/how-to-create-telegram-group" />

        {/* Open Graph */}
        <meta property="og:title" content="How to Create a Telegram Group" />
        <meta property="og:description" content="Complete guide on how to create and manage Telegram groups. Start your own Telegram community today." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://joingroups.pro/how-to-create-telegram-group" />
        <meta property="og:image" content="https://joingroups.pro/og-preview.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Create a Telegram Group" />
        <meta name="twitter:description" content="Learn how to create and grow your Telegram group step-by-step. Perfect for beginners." />
        <meta name="twitter:image" content="https://joingroups.pro/og-preview.png" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">How to Create a Telegram Group</h1>
      <p className="mb-4">
        Telegram groups are a great way to create a community, connect with people, and share content. Whether you're starting a discussion group, a study circle, or a fan club — creating a Telegram group is simple and free.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Open the Telegram App</h2>
      <p className="mb-4">
        Open the Telegram app on your smartphone (Android or iOS) or desktop. Make sure you are logged in with your Telegram account.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Tap "New Group"</h2>
      <p className="mb-4">
        On mobile, tap the pencil icon (✏️) at the bottom right, then choose <strong>"New Group"</strong>. On desktop, click the menu icon and select <strong>"New Group"</strong>.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Add Members</h2>
      <p className="mb-4">
        Select at least one contact to add to the group. You can always add more members later, up to 200,000 participants.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Set Group Name and Photo</h2>
      <p className="mb-4">
        Choose a name for your group — this will be visible to all members. You can also set a profile picture or icon to make your group stand out.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Customize Group Settings</h2>
      <p className="mb-4">
        Once your group is created, open the group settings to:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Write a description</li>
        <li>Set admin roles and permissions</li>
        <li>Create an invite link or QR code</li>
        <li>Control who can post, pin messages, or send media</li>
        <li>Enable bots for moderation, welcome messages, etc.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Share Your Group</h2>
      <p className="mb-4">
        Use your group’s invite link to share it on social media, websites, or platforms like <a href="https://joingroups.pro" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">JoinGroups</a>, where you can publish your group so more people can easily discover it.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Maintain and Grow</h2>
      <p className="mb-4">
        Keep your group active by posting regularly, moderating conversations, and interacting with members. A well-managed group grows naturally.
      </p>

      <p className="mt-6 text-sm text-gray-600">Last updated: June 2025</p>
    </div>
  );
}
