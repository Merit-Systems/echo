I need a full-featured Admin dashboard for the application.



The admin dashboard should have all front-end components built in echo-control/src/app/(app)/admin/_components

The front-end components should contain no business logic, and should all use TRPC.

The TRPC routers should all go in echo-control/src/trpc/routers/admin.ts

The Business logic should all go in the backend, and should be implemented in echo-control/src/services/admin

Unecessary components in these folders should be removed.

The displayed pages should all go in echo-control/src/app/(app)/admin. You should be primarily adjusting the:
echo-control/src/app/(app)/admin/apps/[appId]/page.tsx
echo-control/src/app/(app)/admin/users/[userId]/page.tsx
echo-control/src/app/(app)/admin/dashboard/page.tsx



The Admin dashboard should be a tabbed dashboard with six breakdown views: 


1. User Earnings

    User Earnings should display a table that for all users shows:
    - the email campaigns they have received,
    - their total transactions, total revenue, app profit, markup profit, referral profit
    - The number of referral codes they have generated
    - The number of referrer users they have
    - their total number of apps
    - A clickable link to a fully-featured **User Breakdown page (/user/[user_id])

2. App Earnings

    App Earnings should display a table that for all app shows:
    - The user creator of the app (with link to User Breakdown Page),
    - the email campaigns the app has received,
    - the email campaigns the owner of the app has received
    - the app's total transactions, total revenue, app profit, markup profit, referral profit
    - the app's total number of referral codes
    - A clickable link to a fully-featured **App Breakdown page (/app/[app_id])



3. User Spending
    User Spending should display a table that for all users who've spent that shows:
    - Their total spent
    - Their balance
    - Their free-tier pool usage
    - Their personal balance usage
    - The total amount of money they have paid into the system via stripe payments (payment.source == stripe)
    - A drop-down menu on each row, which shows the identical breakdown but by each app they use
    - Clickable links to a fully-featured **User Breakdown page and **App Breakdown Page as mentioned above

4. User Credit issuance

    - An interface which allows users to be awarded free credits, and for their apps to be awarded free credits. (CreditMinter.tsx)
    - An interface which allows the granting of arbitrary credit codes (CreditCodeMinter.tsx)

5. Payments Received + Global Spending + Global Earnings

    - Payments Received should show a dashboard which makes it explicitly obvious: 
        - The amount of credits that have been issued by:
         - admin
         - signup gift
         - stripe
         - The amount of fees stripe has collected (will be 2.9% of total awarded via stripe)
        - The total amount spent across all apps
            - Total spent on free tier
            - Total spent of user balances
            - Total spent
        - The total amount earned by users across all apps
            - Total referral profit earned
            - Total referral profit claimed (references the payouts table)
            - Total Markup profit earned
            - Total markup amount claimed (references the payouts table)
            - Total spent on transaction costs

    - Below the dashboard: 
        Payments Received should display a table which shows every payment that has gone over the system. it should show: 
        - Payments from every source
        - The amount that was paid 
        - The free tier (and the delta the payment made on that free tier)
        - The associated user (and the delta the payment had on their balance)
 

TABLE COMPONENT
For EVERY table displayed, You should create a shared component that uses AG-Grid and have all tables inherit from this.


1. Working fully-featured search, with a case-insensitive word match for every identifiable column name (name, id, email, app name, app id)
2. Working filtering mechanism with filtering support for every column, as well as multiple columns (for ex: all apps that have 0 transactions and have not received the limbo-app-reminder email)
3. Working timestamps for the "created-at" and "updated-at" columns in database, and the ability to filter by this.
3. Working sorting mechanism which properly sorts with respect to pagination (applying a sort re-fetches pagination in the reverse order)
4. Fully-featured pagination, which is refreshed on every sort or filter (if I apply a search, the pagination should be reset such that I am looking at the first 25 results of that search)
5. Check-box selection, which allows me to apply a variety of actions via an action box sandwich menu.
    - Sending Emails should be controlled through this sandwich menu
    - The data in the table should be automatically refreshed after calling this action



** User Breakdown Page

- This page should show: 
    - A high-level breakdown showing: 
        - The amount of credits that have been issued by:
         - admin
         - signup gift
         - stripe
         - The amount of fees stripe has collected (will be 2.9% of total awarded via stripe)
        - The total amount spent across all apps
            - Total spent on free tier
            - Total spent of user balances
            - Total spent
        - The total amount earned by users across all apps
            - Total referral profit earned
            - Total referral profit claimed (references the payouts table)
            - Total Markup profit earned
            - Total markup amount claimed (references the payouts table)
            - Total spent on transaction costs

    For this, you can re-use the component in (Payments Received + Global Spending + Global Earnings) for but show only the user's data

    - A table of every transaction sorted by time which shows: 

        - total revenue, app profit, markup profit, referral profit
        - The raw model cost, model used, and other transaction metadata
        - The free tier pool spend pool used, it's balance, and the delta that this transaction had on the spend pool
        - the user's usage in the spend pool, and the delta this transaction had on the spend pool
        - the user's balance, and the delta this transaction had on the balance

    - A table of every payment sorted by time which shows:
        - the source of the payment
        - The free tier pool spend pool paid into, it's balance, and the delta that this payment had on the spend pool
        - the user's balance, and the delta this payment had on the balance

    - A table breaking down every email campaign the user has ever received

    There should be an ability to sort and filter both tables by timestamp at the same time.



** App breakdown Page

      - A high-level breakdown showing: 
        - The total amount spent across on this app
            - Total spent on free tier
            - Total spent of user balances
            - Total spent
        - The total amount earned by the  app
            - Total referral profit earned
            - Total referral profit claimed (references the payouts table)
            - Total Markup profit earned
            - Total markup amount claimed (references the payouts table)
            - Total spent on transaction costs
        - Total number of users
        - total transactions
        - total tokens
        - most popular models
        - The owner of the application


     - A table of every transaction sorted by time which shows: 

        - total revenue, app profit, markup profit, referral profit
        - The raw model cost, model used, and other transaction metadata
        - The free tier pool spend pool used, it's balance, and the delta that this transaction had on the spend pool
        - the user's usage in the spend pool, and the delta this transaction had on the spend pool
        - the user's balance, and the delta this transaction had on the balance
        - The user making this transaction

     - A table of every payment sorted by time which shows:
        - the source of the payment
        - The free tier pool spend pool paid into, it's balance, and the delta that this payment had on the spend pool

     
     - a table breaking down every email campaign the owner of the app has ever received, and every email sent about this app