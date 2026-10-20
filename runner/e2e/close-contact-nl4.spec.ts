import { test, expect, type Page, type Locator } from "@playwright/test";

// Uses the mock-mode runner configured in playwright.config.ts. Synthetic
// answers stay in the test session; this journey never submits the form.
const formPath = "/close-contact-form-nl4";
const householdContact = {
  firstName: "Alex",
  lastName: "Taylor",
  email: "alex.taylor@example.com",
};
const closeContacts = [
  {
    firstName: "Jamie",
    lastName: "Morgan",
    email: "jamie.morgan@example.com",
  },
  {
    firstName: "Casey",
    lastName: "Jordan",
    email: "casey.jordan@example.com",
  },
];

async function fillContact(
  page: Page,
  contact: typeof householdContact,
  isCloseContact: boolean,
  contactDirectly = true
) {
  const prefix = isCloseContact ? "Close contact " : "";
  await page
    .getByLabel(`${prefix}${isCloseContact ? "first" : "First"} (given) name`, {
      exact: true,
    })
    .fill(contact.firstName);
  await page
    .getByLabel(`${prefix}${isCloseContact ? "last" : "Last"} (family) name`, {
      exact: true,
    })
    .fill(contact.lastName);
  await page
    .getByRole("radio", {
      name: contactDirectly
        ? "Contact them directly"
        : "Contact their parent, carer or legal guardian",
      exact: true,
    })
    .check();
  await page.getByLabel("Email address", { exact: true }).fill(contact.email);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

async function expectContact(
  container: Locator,
  contact: typeof householdContact
) {
  for (const value of [contact.firstName, contact.lastName, contact.email]) {
    await expect(container).toContainText(value);
  }
}

test("NL4 adds household and close contacts and checks the final summary", async ({
  page,
}) => {
  await test.step("Start the form for myself", async () => {
    const response = await page.goto(`${formPath}/start`);
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", {
        name: "Tell us about people you've been in close contact with",
        exact: true,
      })
    ).toBeVisible();
    await page.getByRole("button", { name: "Start now", exact: true }).click();
    await expect(page).toHaveURL(`${formPath}/completing-form-for`);
    await page.getByRole("radio", { name: "Myself", exact: true }).check();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(`${formPath}/do-you-live-with-other-people`);
  });

  await test.step("Add and check a household contact", async () => {
    await page.getByRole("radio", { name: "yes", exact: true }).check();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(`${formPath}/person-live-with`);
    await fillContact(page, householdContact, false);
    await expect(page).toHaveURL(`${formPath}/person-live-with?view=summary`);
    const card = page.locator(".govuk-summary-card").filter({
      has: page.getByRole("heading", { name: "Person 1", exact: true }),
    });
    await expectContact(card, householdContact);
    await page.getByRole("radio", { name: "No", exact: true }).check();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(`${formPath}/close-contact`);
  });

  await test.step("Add two close contacts using add another", async () => {
    await page.getByRole("radio", { name: "yes", exact: true }).check();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(`${formPath}/close-contacts`);
    await fillContact(page, closeContacts[0], true);
    await expect(page).toHaveURL(`${formPath}/close-contacts?view=summary`);
    await expectContact(page.locator(".govuk-summary-card"), closeContacts[0]);

    await page.getByRole("radio", { name: "Yes", exact: true }).check();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(`${formPath}/close-contacts?view=1`);
    await expect(page.getByLabel("Email address", { exact: true })).toBeEmpty();
    await fillContact(page, closeContacts[1], true, false);
    await expect(page).toHaveURL(`${formPath}/close-contacts?view=summary`);
    await expect(page.locator(".govuk-summary-card")).toHaveCount(2);

    for (const [index, contact] of closeContacts.entries()) {
      const card = page.locator(".govuk-summary-card").filter({
        has: page.getByRole("heading", {
          name: `Close Contact ${index + 1}`,
          exact: true,
        }),
      });
      await expectContact(card, contact);
    }
  });

  await test.step("Check add-another choices separately from contact cards", async () => {
    await expect(
      page.getByRole("radio", { name: "Yes", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "No", exact: true })
    ).toBeVisible();
    await page.getByRole("radio", { name: "No", exact: true }).check();
    await expect(
      page.getByRole("radio", { name: "No", exact: true })
    ).toBeChecked();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  });

  await test.step("Check all saved details without submitting", async () => {
    await expect(page).toHaveURL(`${formPath}/summary`);
    await expect(
      page.getByRole("heading", {
        name: "Check all details before submitting the form",
        exact: true,
      })
    ).toBeVisible();
    for (const contact of [householdContact, ...closeContacts]) {
      await expectContact(page.getByRole("main"), contact);
    }
    await expect(page.locator(".govuk-error-summary")).toHaveCount(0);
  });
});
