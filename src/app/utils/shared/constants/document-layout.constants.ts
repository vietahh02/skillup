export const DOCUMENT_LAYOUTS = {
    'base-layout-content-en-us': {
        name: 'Base Layout (English)',
        template: `
<div style="
  max-width: 700px;
  width: 100%;
  margin: auto;
  padding: 32px;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #7367f0;
  background-color: #f4f6fb;
  border-radius: 4px 4px 0 0;
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
">
  Payment Hub
</div>
<div style="
  max-width: 700px;
  width: 100%;
  margin: auto;
  background-color: #ffffff;
  border-radius: 0 0 4px 4px;
  padding: 48px;
  color: #626262;
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
">
  @RenderBody()
  <hr style="margin: 32px 0; border: none; height: 1px; background-color: #eceff1;" />
  <p style="font-size: 14px;">If you did not expect this email, please disregard it or contact our support team.</p>
  <p style="font-size: 14px; margin-top: 24px;">Thank you,<br>The Payment Hub Team</p>
</div>
<div style="
  text-align: center;
  font-size: 14px;
  color: #999999;
  padding: 32px;
  font-family: 'Montserrat', sans-serif;
">
  Use of our service and website is subject to our
  <a href="https://example.com/terms" style="color: #7367f0; text-decoration: none;">Terms of Use</a> and
  <a href="https://example.com/privacy" style="color: #7367f0; text-decoration: none;">Privacy Policy</a>.
</div>
    `.trim()
    },
    'base-layout-content-my-mm': {
        name: 'Base Layout (Myanmar)',
        template: `
<div style="
  max-width: 700px;
  width: 100%;
  margin: auto;
  padding: 32px;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #7367f0;
  background-color: #f4f6fb;
  border-radius: 4px 4px 0 0;
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
">
  Payment Hub
</div>
<div style="
  max-width: 700px;
  width: 100%;
  margin: auto;
  background-color: #ffffff;
  border-radius: 0 0 4px 4px;
  padding: 48px;
  color: #626262;
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
">
  @RenderBody()
  <hr style="margin: 32px 0; border: none; height: 1px; background-color: #eceff1;" />
  <p style="font-size: 14px;">ဤအီးမေးလ်ကို သင်မမျှော်လင့်ထားပါက၊ လျစ်လျူရှုထားပါ သို့မဟုတ် ကျွန်ုပ်တို့၏ ပံ့ပိုးမှုအဖွဲ့ကို ဆက်သွယ်ပါ။</p>
  <p style="font-size: 14px; margin-top: 24px;">ကျေးဇူးတင်ပါသည်၊<br>Payment Hub အဖွဲ့</p>
</div>
<div style="
  text-align: center;
  font-size: 14px;
  color: #999999;
  padding: 32px;
  font-family: 'Montserrat', sans-serif;
">
  ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုနှင့် ဝက်ဘ်ဆိုက်အသုံးပြုမှုသည် ကျွန်ုပ်တို့၏
  <a href="https://example.com/terms" style="color: #7367f0; text-decoration: none;">အသုံးပြုမှုစည်းမျဉ်းများ</a> နှင့်
  <a href="https://example.com/privacy" style="color: #7367f0; text-decoration: none;">ကိုယ်ရေးလုံခြုံမှုမူဝါဒ</a> နှင့် စပ်လျဉ်းသည်။
</div>
    `.trim()
    }
};

export function parseLayoutFromContent(content: string): string | null {
    // Match both single and double quotes, handle whitespace
    const layoutMatch = content.match(/@\{\s*Layout\s*=\s*["']([^"']+)["']\s*;\s*\}/);
    if (layoutMatch) {
        return layoutMatch[1];
    }
    // Try with escaped quotes or different quote styles
    const layoutMatch2 = content.match(/@\{\s*Layout\s*=\s*["']([^"']+)["']\s*;\s*\}/);
    return layoutMatch2 ? layoutMatch2[1] : null;
}

export function extractContentBody(content: string): string {
    // Remove layout declaration if exists (handle both single and double quotes)
    let body = content.replace(/@\{\s*Layout\s*=\s*["'][^"']+["']\s*;\s*\}\s*/g, '');
    // Also try with escaped quotes
    body = body.replace(/@\{\s*Layout\s*=\s*["'][^"']+["']\s*;\s*\}\s*/g, '');
    return body.trim();
}

export function mergeLayoutWithContent(layoutKey: string, bodyContent: string): string {
    const layout = DOCUMENT_LAYOUTS[layoutKey as keyof typeof DOCUMENT_LAYOUTS];
    if (!layout) {
        return bodyContent; // Return original content if layout not found
    }
    return layout.template.replace('@RenderBody()', bodyContent);
}

// Base templates for each email type
export const EMAIL_TEMPLATES = {
    'NOTIFICATION_NEW_PASSWORD': {
        name: 'Notify New Password',
        requiredFields: ['Username', 'Password'],
        templateEn: `@{
    Layout = "base-layout-content-en-us";
}

<p style="font-size: 20px; font-weight: 600; margin: 0;">Password Reset Notification</p>

<p style="font-size: 24px; font-weight: 700; color: #7367f0; margin-top: 0;">@Model.Username</p>

<p>We would like to inform you that your password on <strong>Payment Hub</strong> has been successfully reset by your administrator. Kindly refer to the new login credentials below.</p>

<p style="margin-top: 24px;"><strong>Login credentials:</strong></p>

<ul style="margin-top: 8px;">
  <li><strong>Username:</strong> [@Model.Username]</li>
  <li><strong>New Password:</strong> [@Model.Password]</li>
</ul>

<div style="
  background-color: #fff3e0;
  border-radius: 6px;
  padding: 12px 16px;
  color: #8d4700;
  font-size: 14px;
  margin-top: 24px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
">
  <span style="font-size: 18px; margin-right: 12px; margin-top: 2px;">⚠️</span>
  <span>Please log in and change your password immediately to ensure the security of your account.</span>
</div>

<p style="margin-top: 24px;">
  If you have any questions or concerns, please contact our support team at
  <a href="mailto:support@example.com" style="color: #7367f0; text-decoration: none;">support@example.com</a>.
</p>`,
        templateMy: `@{
    Layout = "base-layout-content-my-mm";
}

<p style="font-size: 20px; font-weight: 600; margin: 0;">စကားဝှက်ပြန်လည်သတ်မှတ်ခြင်းအကြောင်းကြားစာ</p>

<p style="font-size: 24px; font-weight: 700; color: #7367f0; margin-top: 0;">@Model.Username</p>

<p>သင်၏ <strong>Payment Hub</strong> အကောင့်ရှိ စကားဝှက်ကို သင်၏စီမံခန့်ခွဲသူမှ အောင်မြင်စွာ ပြန်လည်သတ်မှတ်ထားကြောင်း သတင်းပို့အပ်ပါသည်။ အောက်ပါ လော့ဂ်အင်အကောင့်အချက်အလက်များကို ကိုးကားပါ။</p>

<p style="margin-top: 24px;"><strong>လော့ဂ်အင်အကောင့်အချက်အလက်များ:</strong></p>

<ul style="margin-top: 8px;">
  <li><strong>အသုံးပြုသူအမည်:</strong> [@Model.Username]</li>
  <li><strong>စကားဝှက်အသစ်:</strong> [@Model.Password]</li>
</ul>

<div style="
  background-color: #fff3e0;
  border-radius: 6px;
  padding: 12px 16px;
  color: #8d4700;
  font-size: 14px;
  margin-top: 24px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
">
  <span style="font-size: 18px; margin-right: 12px; margin-top: 2px;">⚠️</span>
  <span>သင်၏အကောင့်၏လုံခြုံမှုကို သေချာစေရန် ကျေးဇူးပြု၍ ချက်ချင်းလော့ဂ်အင်ဝင်ပြီး စကားဝှက်ကို ပြောင်းလဲပါ။</span>
</div>

<p style="margin-top: 24px;">
  သင့်တွင် မေးခွန်းများ သို့မဟုတ် စိုးရိမ်မှုများရှိပါက၊ ကျေးဇူးပြု၍ ကျွန်ုပ်တို့၏ပံ့ပိုးမှုအဖွဲ့သို့ ဆက်သွယ်ပါ
  <a href="mailto:support@example.com" style="color: #7367f0; text-decoration: none;">support@example.com</a>.
</p>`
    },
    'NOTIFICATION_CHANGED_PASS': {
        name: 'Notify Password Changed',
        requiredFields: ['Username'],
        templateEn: `@{
    Layout = "base-layout-content-en-us";
}

<p style="font-size: 20px; font-weight: 600; margin: 0;">Security alert</p>

<p style="font-size: 24px; font-weight: 700; color: #7367f0; margin-top: 0;">@Model.Username</p>

<p>We're letting you know that the password for your <strong>Payment Hub</strong> account was recently changed.</p>

<p>If you made this change, no further action is needed.</p>

<div style="
  background-color: #fff3e0;
  border-radius: 6px;
  padding: 12px 16px;
  color: #8d4700;
  font-size: 14px;
  margin-top: 24px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
">
  <span style="font-size: 18px; margin-right: 12px; margin-top: 2px;">⚠️</span>
  <span>If you did not change your password, please contact our support team immediately to secure your account.</span>
</div>

<p style="margin-top: 24px;">
  If you have any questions or concerns, please contact our support team at
  <a href="mailto:support@example.com" style="color: #7367f0; text-decoration: none;">support@example.com</a>.
</p>`,
        templateMy: `@{
    Layout = "base-layout-content-my-mm";
}

<p style="font-size: 20px; font-weight: 600; margin: 0;">လုံခြုံမှုသတိပေးချက်</p>

<p style="font-size: 24px; font-weight: 700; color: #7367f0; margin-top: 0;">@Model.Username</p>

<p>သင်၏ <strong>Payment Hub</strong> အကောင့်အတွက် စကားဝှက်ကို မကြာသေးမီက ပြောင်းလဲထားကြောင်း သတင်းပို့အပ်ပါသည်။</p>

<p>သင်က ဤပြောင်းလဲမှုကို ပြုလုပ်ထားပါက၊ နောက်ထပ် လုပ်ဆောင်ရန် မလိုအပ်ပါ။</p>

<div style="
  background-color: #fff3e0;
  border-radius: 6px;
  padding: 12px 16px;
  color: #8d4700;
  font-size: 14px;
  margin-top: 24px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
">
  <span style="font-size: 18px; margin-right: 12px; margin-top: 2px;">⚠️</span>
  <span>သင်က စကားဝှက်ကို မပြောင်းလဲထားပါက၊ သင်၏အကောင့်ကို လုံခြုံစေရန် ကျေးဇူးပြု၍ ကျွန်ုပ်တို့၏ပံ့ပိုးမှုအဖွဲ့သို့ ချက်ချင်းဆက်သွယ်ပါ။</span>
</div>

<p style="margin-top: 24px;">
  သင့်တွင် မေးခွန်းများ သို့မဟုတ် စိုးရိမ်မှုများရှိပါက၊ ကျေးဇူးပြု၍ ကျွန်ုပ်တို့၏ပံ့ပိုးမှုအဖွဲ့သို့ ဆက်သွယ်ပါ
  <a href="mailto:support@example.com" style="color: #7367f0; text-decoration: none;">support@example.com</a>.
</p>`
    },
    'USER_RECOVERY_PASS': {
        name: 'User Recovery Password',
        requiredFields: ['Username', 'Link', 'BaseUrl', 'Ip'],
        templateEn: `@{
    Layout = "base-layout-content-en-us";
}

<p style="font-size: 20px; font-weight: 600; margin: 0;">Recover your password</p>

<p style="font-size: 24px; font-weight: 700; color: #7367f0; margin-top: 0;">@Model.Username</p>

<p>We received a request to recover the password for your account on <strong>Payment Hub</strong>.</p>

<p>If you made this request, click the button below to set a new password:</p>

<a href="@Model.BaseUrl@Model.Link" style="
  display: inline-block;
  padding: 16px 24px;
  background-color: #7367f0;
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  border-radius: 4px;
  margin-top: 24px;
">
  Recover Password
</a>

<p style="margin-top: 24px;">This link will expire in 1 hour. If it expires, you can request a new one.</p>

<div style="
  background-color: #fff3e0;
  border-radius: 6px;
  padding: 12px 16px;
  color: #8d4700;
  font-size: 14px;
  margin-top: 24px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
">
  <span style="font-size: 18px; margin-right: 12px; margin-top: 2px;">⚠️</span>
  <span>If you didn't request this password recovery, please ignore this message or contact our support team.</span>
</div>

<p style="margin-top: 24px;">
  If you have any questions or concerns, please contact our support team at
  <a href="mailto:support@example.com" style="color: #7367f0; text-decoration: none;">support@example.com</a>.
</p>`,
        templateMy: `@{
    Layout = "base-layout-content-my-mm";
}

<p style="font-size: 20px; font-weight: 600; margin: 0;">သင်၏စကားဝှက်ကို ပြန်လည်ရယူပါ</p>

<p style="font-size: 24px; font-weight: 700; color: #7367f0; margin-top: 0;">@Model.Username</p>

<p>သင်၏ <strong>Payment Hub</strong> အကောင့်အတွက် စကားဝှက်ကို ပြန်လည်ရယူရန် တောင်းဆိုမှုတစ်ခု ကျွန်ုပ်တို့ လက်ခံရရှိပါသည်။</p>

<p>သင်က ဤတောင်းဆိုမှုကို ပြုလုပ်ထားပါက၊ စကားဝှက်အသစ်တစ်ခု သတ်မှတ်ရန် အောက်ပါခလုတ်ကို နှိပ်ပါ:</p>

<a href="@Model.BaseUrl@Model.Link" style="
  display: inline-block;
  padding: 16px 24px;
  background-color: #7367f0;
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  border-radius: 4px;
  margin-top: 24px;
">
  စကားဝှက်ကို ပြန်လည်ရယူပါ
</a>

<p style="margin-top: 24px;">ဤလင့်ခ်သည် 1 နာရီအတွင်း သက်တမ်းကုန်ဆုံးမည်ဖြစ်သည်။ သက်တမ်းကုန်ဆုံးပါက၊ သင်သည် အသစ်တစ်ခုကို တောင်းဆိုနိုင်သည်။</p>

<div style="
  background-color: #fff3e0;
  border-radius: 6px;
  padding: 12px 16px;
  color: #8d4700;
  font-size: 14px;
  margin-top: 24px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
">
  <span style="font-size: 18px; margin-right: 12px; margin-top: 2px;">⚠️</span>
  <span>သင်က ဤစကားဝှက် ပြန်လည်ရယူမှုကို တောင်းဆိုထားခြင်းမရှိပါက၊ ကျေးဇူးပြု၍ ဤစာကို လျစ်လျူရှုထားပါ သို့မဟုတ် ကျွန်ုပ်တို့၏ပံ့ပိုးမှုအဖွဲ့သို့ ဆက်သွယ်ပါ။</span>
</div>

<p style="margin-top: 24px;">
  သင့်တွင် မေးခွန်းများ သို့မဟုတ် စိုးရိမ်မှုများရှိပါက၊ ကျေးဇူးပြု၍ ကျွန်ုပ်တို့၏ပံ့ပိုးမှုအဖွဲ့သို့ ဆက်သွယ်ပါ
  <a href="mailto:support@example.com" style="color: #7367f0; text-decoration: none;">support@example.com</a>.
</p>`
    },
    'WELCOME_USER': {
        name: 'Welcome',
        requiredFields: ['Username', 'Password', 'BaseUrl'],
        templateEn: `@{
    Layout = "base-layout-content-en-us";
}

<p style="font-size: 20px; font-weight: 600; margin: 0;">Welcome</p>

<p style="font-size: 24px; font-weight: 700; color: #7367f0; margin-top: 0;">@Model.Username!</p>

<p>We are pleased to inform you that your account has been successfully created on <strong>Payment Hub</strong>.</p>

<p style="margin-top: 24px; margin-bottom: 0;"><strong>Your login details:</strong></p>

<ul style="margin-top: 8px;">
  <li><strong>Username:</strong> @Model.Username</li>
  <li><strong>Temporary Password:</strong> @Model.Password</li>
</ul>

<div style="
  background-color: #fff3e0;
  border-radius: 6px;
  padding: 12px 16px;
  color: #8d4700;
  font-size: 14px;
  margin-top: 24px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
">
  <span style="font-size: 18px; margin-right: 12px; margin-top: 2px;">⚠️</span>
  <span>Please log in and change your password immediately to ensure the security of your account.</span>
</div>

<a href="@Model.BaseUrl" style="
  display: inline-block;
  padding: 16px 24px;
  background-color: #7367f0;
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  border-radius: 4px;
  margin-top: 24px;">
  Go to Payment Hub &rarr;
</a>

<p style="margin-top: 24px;">
  If you have any questions or concerns, please contact our support team at
  <a href="mailto:support@example.com" style="color: #7367f0; text-decoration: none;">support@example.com</a>.
</p>`,
        templateMy: `@{
    Layout = "base-layout-content-my-mm";
}

<p style="font-size: 20px; font-weight: 600; margin: 0;">ကြိုဆိုပါသည်</p>

<p style="font-size: 24px; font-weight: 700; color: #7367f0; margin-top: 0;">@Model.Username!</p>

<p>သင်၏အကောင့်ကို <strong>Payment Hub</strong> တွင် အောင်မြင်စွာ ဖန်တီးထားကြောင်း သတင်းပို့အပ်ပါသည်။</p>

<p style="margin-top: 24px; margin-bottom: 0;"><strong>သင်၏လော့ဂ်အင်အချက်အလက်များ:</strong></p>

<ul style="margin-top: 8px;">
  <li><strong>အသုံးပြုသူအမည်:</strong> @Model.Username</li>
  <li><strong>ယာယီစကားဝှက်:</strong> @Model.Password</li>
</ul>

<div style="
  background-color: #fff3e0;
  border-radius: 6px;
  padding: 12px 16px;
  color: #8d4700;
  font-size: 14px;
  margin-top: 24px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
">
  <span style="font-size: 18px; margin-right: 12px; margin-top: 2px;">⚠️</span>
  <span>သင်၏အကောင့်၏လုံခြုံမှုကို သေချာစေရန် ကျေးဇူးပြု၍ ချက်ချင်းလော့ဂ်အင်ဝင်ပြီး စကားဝှက်ကို ပြောင်းလဲပါ။</span>
</div>

<a href="@Model.BaseUrl" style="
  display: inline-block;
  padding: 16px 24px;
  background-color: #7367f0;
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  border-radius: 4px;
  margin-top: 24px;">
  Payment Hub သို့သွားရန် &rarr;
</a>

<p style="margin-top: 24px;">
  သင့်တွင် မေးခွန်းများ သို့မဟုတ် စိုးရိမ်မှုများရှိပါက၊ ကျေးဇူးပြု၍ ကျွန်ုပ်တို့၏ပံ့ပိုးမှုအဖွဲ့သို့ ဆက်သွယ်ပါ
  <a href="mailto:support@example.com" style="color: #7367f0; text-decoration: none;">support@example.com</a>.
</p>`
    }
};

export function getTemplateByCode(code: string, language: string = 'en'): string | null {
    const template = EMAIL_TEMPLATES[code as keyof typeof EMAIL_TEMPLATES];
    if (!template) {
        return null;
    }

    // Return template based on language
    if (language === 'mm') {
        return template.templateMy || null;
    }

    return template.templateEn || null;
}

export function getRequiredFieldsByCode(code: string): string[] {
    const template = EMAIL_TEMPLATES[code as keyof typeof EMAIL_TEMPLATES];
    return template?.requiredFields || [];
}

export function validateRequiredFields(content: string, requiredFields: string[]): {
    isValid: boolean;
    missingFields: string[]
} {
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
        // Check for @FieldName or @Model.FieldName
        const pattern1 = new RegExp(`@${field}\\b`, 'i');
        const pattern2 = new RegExp(`@Model\\.${field}\\b`, 'i');

        if (!pattern1.test(content) && !pattern2.test(content)) {
            missingFields.push(field);
        }
    });

    return {
        isValid: missingFields.length === 0,
        missingFields
    };
}

