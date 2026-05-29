import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection
transporter.verify((error: any) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("✅ SMTP server ready");
  }
});

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const mailOptions = {
      from: `"Campus Lost & Found" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }
};

// Send dispute-related email with appropriate template
export const sendDisputeEmail = async (
  to: string,
  name: string,
  template: keyof typeof emailTemplates,
  params: any,
): Promise<{ success: boolean; messageId?: string }> => {
  let templateData;

  switch (template) {
    case "disputeFiled":
      templateData = emailTemplates.disputeFiled(
        name,
        params.disputeTitle,
        params.itemName,
        params.disputeId,
      );
      break;
    case "disputeUpdate":
      templateData = emailTemplates.disputeUpdate(
        name,
        params.disputeTitle,
        params.status,
        params.message,
        params.disputeId,
      );
      break;
    case "disputeResolved":
      templateData = emailTemplates.disputeResolved(
        name,
        params.disputeTitle,
        params.resolutionType,
        params.description,
        params.disputeId,
      );
      break;
    case "disputeEscalated":
      templateData = emailTemplates.disputeEscalated(
        name,
        params.disputeTitle,
        params.reason,
        params.disputeId,
      );
      break;
    case "disputeAssigned":
      templateData = emailTemplates.disputeAssigned(
        name,
        params.disputeTitle,
        params.assignedBy,
        params.disputeId,
      );
      break;
    case "newMessageInDispute":
      templateData = emailTemplates.newMessageInDispute(
        name,
        params.disputeTitle,
        params.senderName,
        params.messagePreview,
        params.disputeId,
      );
      break;
    case "adminAlert":
      templateData = emailTemplates.adminAlert(
        name,
        params.alertType,
        params.details,
        params.actionUrl,
      );
      break;
    default:
      throw new Error(`Invalid dispute email template: ${template}`);
  }

  return sendEmail({
    to,
    subject: templateData.subject,
    html: templateData.html,
  });
};

// Email templates
export const emailTemplates = {
  welcome: (name: string, collegeName: string) => ({
    subject: `Welcome to ${collegeName} Lost & Found!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Campus Lost & Found!</h2>
        <p>Hello ${name},</p>
        <p>Your account has been successfully created for <strong>${collegeName}</strong>.</p>
        <p>You can now:</p>
        <ul>
          <li>Report lost items</li>
          <li>Browse found items</li>
          <li>Connect with finders/owners</li>
          <li>Track your items</li>
        </ul>
        <p>Start exploring: <a href="${process.env.FRONTEND_URL}/dashboard">${process.env.FRONTEND_URL}/dashboard</a></p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  }),

  verifyEmail: (name: string, token: string) => ({
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Email Verification</h2>
        <p>Hello ${name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/verify-email/${token}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy this link: <br>
        <code style="background: #f3f4f6; padding: 8px; display: block; word-break: break-all;">
          ${process.env.FRONTEND_URL}/verify-email/${token}
        </code></p>
        <p>This link will expire in <strong>24 hours</strong>.</p>
        <p>If you didn't create an account, you can ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
      </div>
    `,
  }),

  resetPassword: (name: string, token: string) => ({
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/reset-password/${token}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy this link: <br>
        <code style="background: #f3f4f6; padding: 8px; display: block; word-break: break-all;">
          ${process.env.FRONTEND_URL}/reset-password/${token}
        </code></p>
        <p>This link will expire in <strong>1 hour</strong>.</p>
        <p>If you didn't request this, please ignore this email or contact support.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
      </div>
    `,
  }),

  passwordChanged: (name: string) => ({
    subject: "Password Changed Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Updated</h2>
        <p>Hello ${name},</p>
        <p>Your password has been successfully changed.</p>
        <p>If you didn't make this change, please contact your college admin immediately.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="color: #991b1b; margin: 0;">⚠️ Didn't request this? Contact support immediately.</p>
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
      </div>
    `,
  }),

  emailVerified: (name: string) => ({
    subject: "Email Verified Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Email Verified!</h2>
        <p>Hello ${name},</p>
        <p>Your email address has been successfully verified.</p>
        <p>You now have full access to all features:</p>
        <ul>
          <li>Post lost & found items</li>
          <li>Chat with other users</li>
          <li>Receive match notifications</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
      </div>
    `,
  }),

  itemMatch: (
    name: string,
    itemName: string,
    matchScore: number,
    postId: string,
  ) => ({
    subject: `🎯 Potential Match Found: ${itemName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Potential Match Found!</h2>
        <p>Hello ${name},</p>
        <p>We found a potential match for your item <strong>"${itemName}"</strong> with <strong>${Math.round(matchScore * 100)}%</strong> similarity.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/post/${postId}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            View Match
          </a>
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
      </div>
    `,
  }),

  chatRequest: (name: string, senderName: string, itemName: string) => ({
    subject: `💬 New Chat Request: ${itemName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Chat Request</h2>
        <p>Hello ${name},</p>
        <p><strong>${senderName}</strong> wants to chat with you about <strong>"${itemName}"</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/chats" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            View Chat
          </a>
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
      </div>
    `,
  }),

  disputeFiled: (
    name: string,
    disputeTitle: string,
    itemName: string,
    disputeId: string,
  ) => ({
    subject: `Dispute Filed: ${disputeTitle}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Dispute Filed Against You</h2>
      <p>Hello ${name},</p>
      <p>A dispute has been filed against you regarding the item <strong>"${itemName}"</strong>.</p>
      <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="margin: 0 0 5px 0;"><strong>Dispute:</strong> ${disputeTitle}</p>
        <p style="margin: 0;"><strong>ID:</strong> ${disputeId}</p>
      </div>
      <p>Please check the dispute details and respond appropriately.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/disputes/${disputeId}" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Dispute
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  disputeUpdate: (
    name: string,
    disputeTitle: string,
    status: string,
    message: string,
    disputeId: string,
  ) => ({
    subject: `Dispute Update: ${disputeTitle}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Dispute Status Updated</h2>
      <p>Hello ${name},</p>
      <p>There's been an update to the dispute <strong>"${disputeTitle}"</strong>.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0 0 5px 0;"><strong>New Status:</strong> ${status.toUpperCase()}</p>
        <p style="margin: 0;"><strong>Update:</strong> ${message}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/disputes/${disputeId}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Dispute
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  disputeResolved: (
    name: string,
    disputeTitle: string,
    resolutionType: string,
    description: string,
    disputeId: string,
  ) => ({
    subject: `Dispute Resolved: ${disputeTitle}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Dispute Resolved</h2>
      <p>Hello ${name},</p>
      <p>The dispute <strong>"${disputeTitle}"</strong> has been resolved.</p>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p style="margin: 0 0 5px 0;"><strong>Resolution:</strong> ${resolutionType.replace(/_/g, " ").toUpperCase()}</p>
        <p style="margin: 0;"><strong>Details:</strong> ${description}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/disputes/${disputeId}" 
           style="background-color: #10b981; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Resolution
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  disputeEscalated: (
    name: string,
    disputeTitle: string,
    reason: string,
    disputeId: string,
  ) => ({
    subject: `Dispute Escalated: ${disputeTitle}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Dispute Escalated to Super Admin</h2>
      <p>Hello ${name},</p>
      <p>The dispute <strong>"${disputeTitle}"</strong> has been escalated for higher review.</p>
      <div style="background: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0 0 5px 0;"><strong>Escalation Reason:</strong></p>
        <p style="margin: 0;">${reason}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/disputes/${disputeId}" 
           style="background-color: #f59e0b; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Escalated Dispute
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  disputeAssigned: (
    name: string,
    disputeTitle: string,
    assignedBy: string,
    disputeId: string,
  ) => ({
    subject: `Dispute Assigned to You: ${disputeTitle}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Dispute Assigned to You</h2>
      <p>Hello ${name},</p>
      <p>You have been assigned to handle the dispute <strong>"${disputeTitle}"</strong>.</p>
      <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Assigned by:</strong> ${assignedBy}</p>
      </div>
      <p>Please review the dispute and take appropriate action.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/admin/disputes/${disputeId}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Review Dispute
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  newMessageInDispute: (
    name: string,
    disputeTitle: string,
    senderName: string,
    messagePreview: string,
    disputeId: string,
  ) => ({
    subject: `New Message in Dispute: ${disputeTitle}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Message Received</h2>
      <p>Hello ${name},</p>
      <p><strong>${senderName}</strong> has added a new message to the dispute <strong>"${disputeTitle}"</strong>.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #4b5563;">"${messagePreview}${messagePreview.length >= 100 ? "..." : ""}"</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/disputes/${disputeId}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Conversation
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  itemFlagged: (
    name: string,
    itemName: string,
    flagCount: number,
    itemId: string,
  ) => ({
    subject: `Item Flagged: ${itemName}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Item Flagged for Review</h2>
      <p>Hello ${name},</p>
      <p>Your item <strong>"${itemName}"</strong> has been flagged by the community.</p>
      <div style="background: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Flag Count:</strong> ${flagCount}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">If this reaches 5 flags, the item will be hidden for review.</p>
      </div>
      <p>Please ensure your item follows community guidelines.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/items/${itemId}" 
           style="background-color: #f59e0b; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Item
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  itemClaimed: (
    name: string,
    itemName: string,
    claimantName: string,
    itemId: string,
  ) => ({
    subject: `Item Claimed: ${itemName}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Item Successfully Claimed!</h2>
      <p>Hello ${name},</p>
      <p>Great news! Your item <strong>"${itemName}"</strong> has been claimed by <strong>${claimantName}</strong>.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/items/${itemId}" 
           style="background-color: #10b981; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Item Details
        </a>
      </div>
      <p>Please coordinate with the claimant to arrange the return.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  itemReturned: (
    name: string,
    itemName: string,
    returnedToName: string,
    itemId: string,
  ) => ({
    subject: `Item Returned: ${itemName}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Item Marked as Returned!</h2>
      <p>Hello ${name},</p>
      <p>The item <strong>"${itemName}"</strong> has been marked as returned to <strong>${returnedToName}</strong>.</p>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;">Thank you for using Campus Lost & Found to reunite items with their owners!</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/items/${itemId}" 
           style="background-color: #10b981; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Item
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  newComment: (
    name: string,
    itemName: string,
    commenterName: string,
    commentPreview: string,
    itemId: string,
  ) => ({
    subject: `New Comment on: ${itemName}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Comment Received</h2>
      <p>Hello ${name},</p>
      <p><strong>${commenterName}</strong> commented on your item <strong>"${itemName}"</strong>.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #4b5563;">"${commentPreview}${commentPreview.length >= 100 ? "..." : ""}"</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/items/${itemId}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Comment
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  itemVerified: (
    name: string,
    itemName: string,
    verifiedBy: string,
    itemId: string,
  ) => ({
    subject: `Item Verified: ${itemName}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Item Verified by Admin</h2>
      <p>Hello ${name},</p>
      <p>Your item <strong>"${itemName}"</strong> has been verified by <strong>${verifiedBy}</strong>.</p>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;">✓ Verified items get better visibility and trust from the community.</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/items/${itemId}" 
           style="background-color: #10b981; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Verified Item
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Campus Lost & Found</p>
    </div>
  `,
  }),

  adminAlert: (
    adminName: string,
    alertType: string,
    details: string,
    actionUrl: string,
  ) => ({
    subject: `Admin Alert: ${alertType}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Admin Alert</h2>
      <p>Hello ${adminName},</p>
      <p><strong>Alert Type:</strong> ${alertType}</p>
      <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;">${details}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}${actionUrl}" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Take Action
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">This is an automated admin alert. Please respond promptly.</p>
    </div>
  `,
  }),
};
