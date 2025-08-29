# DoseWise: محاسبه‌گر هوشمند دوز دارو

این یک برنامه Next.js است که برای محاسبه دوز داروی کودکان بر اساس وزن یا سن و با استفاده از هوش مصنوعی برای ارائه نکات تکمیلی ساخته شده است.

---

## نحوه استقرار (Deploy) پروژه در گیت‌هاب پیجز (GitHub Pages)

برای اینکه برنامه شما به صورت یک وب‌سایت زنده درآید، باید آن را در GitHub Pages مستقر کنید. این فرآیند با استفاده از **GitHub Actions** کاملاً خودکار می‌شود.

### پیش‌نیازها

1.  **اتصال پروژه به گیت‌هاب:** ابتدا طبق راهنمای زیر، پروژه خود را به یک ریپازیتوری در گیت‌هاب متصل کنید.
2.  **Node.js:** مطمئن شوید که Node.js روی سیستم شما نصب است.

---

### بخش اول: اتصال پروژه به گیت‌هاب (اگر هنوز انجام نداده‌اید)

اگر پروژه را به گیت‌هاب `push` نکرده‌اید، این مراحل را در **ترمینال همین محیط (Firebase Studio)** اجرا کنید:

1.  **ساخت ریپازیتوری جدید در GitHub.com:**
    *   یک ریپازیتوری جدید و **خالی** بسازید (تیک گزینه‌های README, .gitignore, license را نزنید).

2.  **اجرای دستورات در ترمینال:**
    ```bash
    # مقداردهی اولیه Git
    git init -b main

    # افزودن تمام فایل‌ها
    git add .

    # ثبت کامیت اولیه
    git commit -m "Initial commit of DoseWise application"

    # اتصال به ریپازیتوری گیت‌هاب (دستور زیر را از صفحه گیت‌هاب خود کپی کنید)
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

    # ارسال کد به گیت‌هاب
    git push -u origin main
    ```

---

### بخش دوم: راه‌اندازی استقرار خودکار با GitHub Actions

بعد از اینکه کد شما روی گیت‌هاب قرار گرفت، مراحل زیر را در **وب‌سایت گیت‌هاب** دنبال کنید:

1.  **فعال‌سازی GitHub Pages:**
    *   وارد ریپازیتوری خود در گیت‌هاب شوید.
    *   به تب **Settings** بروید.
    *   در منوی سمت چپ، روی **Pages** کلیک کنید.
    *   در بخش `Build and deployment`، زیر منبع (`Source`)، گزینه **GitHub Actions** را انتخاب کنید.

2.  **ساخت فایل Workflow:**
    *   گیت‌هاب به شما چند نمونه Action پیشنهاد می‌دهد. روی دکمه **Configure** در کنار **"Next.js"** کلیک کنید.
    *   یک فایل جدید به نام `nextjs.yml` برای شما باز می‌شود. **محتوای آن را به طور کامل پاک کنید** و کد زیر را جایگزین آن کنید:

    ```yaml
    # نام Workflow
    name: Deploy Next.js site to Pages

    # زمان اجرا: هر بار که کدی به شاخه main پوش شود
    on:
      push:
        branches: ["main"]
      workflow_dispatch:

    # دسترسی‌های لازم برای Workflow
    permissions:
      contents: read
      pages: write
      id-token: write

    # تنظیمات مربوط به کنسل کردن اجراهای تکراری
    concurrency:
      group: "pages"
      cancel-in-progress: true

    jobs:
      # مرحله ساخت (Build)
      build:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout
            uses: actions/checkout@v4
          - name: Setup Node
            uses: actions/setup-node@v4
            with:
              node-version: "20"
              cache: "npm"
          - name: Install dependencies
            run: npm install
          - name: Build with Next.js
            run: npm run build
          - name: Upload artifact
            uses: actions/upload-pages-artifact@v3
            with:
              path: ./out

      # مرحله استقرار (Deploy)
      deploy:
        needs: build
        runs-on: ubuntu-latest
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        steps:
          - name: Deploy to GitHub Pages
            id: deployment
            uses: actions/deploy-pages@v4
    ```

3.  **ذخیره و اجرای Action:**
    *   روی دکمه **Commit changes...** کلیک کنید.
    *   یک پنجره باز می‌شود، دوباره روی **Commit changes** کلیک کنید.

---

### نتیجه

تمام شد! حالا به تب **Actions** در ریپازیتوری خود بروید. خواهید دید که یک فرآیند جدید در حال اجراست. صبر کنید تا هر دو مرحله `build` و `deploy` با تیک سبز مشخص شوند (ممکن است چند دقیقه طول بکشد).

پس از اتمام، می‌توانید به آدرس گیت‌هاب پیجز خود (که در بخش `Settings > Pages` مشخص شده) مراجعه کرده و وب‌سایت فعال خود را ببینید.

از این به بعد، هر تغییری که روی کد خود اعمال کرده و به شاخه `main` پوش کنید، به طور خودکار سایت شما را به‌روزرسانی خواهد کرد.
