import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

import {
  deriveSelectedFieldName,
  resolveAddressByUdprn,
  findMatchingAddress,
  cleanAddresses,
  AddressLookupFields,
} from "../addressUtils";
import { Address } from "server/services/addressLookupService";

const buildAddress = (overrides: Partial<Address> = {}): Address => ({
  address: "1 Test Street, London",
  postcode: "SW1A 1AA",
  udprn: "20764756",
  uprn: "185788542",
  countryCode: "E",
  ...overrides,
});

suite("addressUtils", () => {
  suite("deriveSelectedFieldName", () => {
    test("returns reportAddress_addressSelection for reportAddress", () => {
      expect(deriveSelectedFieldName("reportAddress")).to.equal(
        "reportAddress_addressSelection"
      );
    });

    test("returns deliveryAddress_addressSelection for deliveryAddress", () => {
      expect(deriveSelectedFieldName("deliveryAddress")).to.equal(
        "deliveryAddress_addressSelection"
      );
    });
  });

  suite("resolveAddressByUdprn", () => {
    const addresses = [
      buildAddress({ udprn: "111" }),
      buildAddress({ udprn: "222" }),
    ];

    test("returns the matching address", () => {
      expect(resolveAddressByUdprn(addresses, "222")).to.equal(addresses[1]);
    });

    test("returns undefined when no address matches", () => {
      expect(resolveAddressByUdprn(addresses, "999")).to.equal(undefined);
    });
  });

  suite("findMatchingAddress", () => {
    const addresses = [
      buildAddress({ address: "Flat 1, 2 Test Street, London" }),
      buildAddress({ address: "12 Test Street, London" }),
      buildAddress({ address: "Flat 2, 1 Test Street, London" }),
      buildAddress({ address: "Cottage, Test Street London" }),
      buildAddress({
        address:
          "COMPANY NAME TYPE OF BUSINESS SERVICES LTD, PLACE BUILDING HOUSE, TESTING CRESCENT, GIANT'S ROAD, BIG INDUSTRIAL PARK, AREAZONE, LARGETOWN",
      }),
      buildAddress({ address: "Exclamation, Test Street, London" }),
    ];

    test("matches on building name/number", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        building: "12",
      };

      expect(findMatchingAddress(addresses, addressFields)).to.equal(
        addresses[1]
      );
    });

    test("matches on address line 1", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        addressLine1: "12 Test Street",
      };

      expect(findMatchingAddress(addresses, addressFields)).to.equal(
        addresses[1]
      );
    });

    test("matches address line 1 based on order of search terms", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        addressLine1: "Flat 2 1 Test Street",
      };
      expect(findMatchingAddress(addresses, addressFields)).to.equal(
        addresses[2]
      );

      const addressFields2: AddressLookupFields = {
        postcode: "SW1A 1AA",
        addressLine1: "Flat 1 2 Test Street",
      };

      expect(findMatchingAddress(addresses, addressFields2)).to.equal(
        addresses[0]
      );
    });

    test("address matches with minor typo", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        addressLine1: "Cottagw",
      };

      expect(findMatchingAddress(addresses, addressFields)).to.equal(
        addresses[3]
      );
    });

    test("returns undefined with major typo", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        addressLine1: "Collage",
      };

      expect(findMatchingAddress(addresses, addressFields)).to.equal(undefined);
    });

    test("handle long search terms", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        addressLine1:
          "COMPANY NAME TYPE OF BUSINESS SERVICES LTD, PLACE BUILDING HOUSE",
        addressLine2:
          "TESTING CRESCENT, GIANT'S ROAD, BIG INDUSTRIAL PARK, AREAZONE",
        town: "LARGETOWN",
      };

      expect(findMatchingAddress(addresses, addressFields)).to.equal(
        addresses[4]
      );
    });

    test("match when ! in address search", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        addressLine1: "Exclamation!",
      };

      expect(findMatchingAddress(addresses, addressFields)).to.equal(
        addresses[5]
      );
    });

    test("returns undefined when nothing matches", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        addressLine1: "999",
        addressLine2: "Nowhere Street",
      };

      expect(findMatchingAddress(addresses, addressFields)).to.equal(undefined);
    });
  });

  suite("cleanAddresses", () => {
    test("removes the comma directly after a leading street number", () => {
      const addresses = [buildAddress({ address: "12A, Test Street" })];

      expect(cleanAddresses(addresses)[0].address).to.equal("12A Test Street");
    });
  });

  suite("punctuation tests", () => {
    const addresses = [
      buildAddress({ address: "11, Test Street, SW1A 1AA" }),
      buildAddress({ address: "1.1, Test Street, SW1A 1AA" }),
      buildAddress({ address: "1/1, Test Street, SW1A 1AA" }),
      buildAddress({ address: "1-1, Test Street, SW1A 1AA" }),
      buildAddress({ address: "Flat 1, Test Street, SW1A 1AA" }),
    ];

    test("matches . in address", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        building: "1.1",
      };

      expect(findMatchingAddress(addresses, addressFields)).to.equal(
        addresses[1]
      );
    });

    test("matches / in address", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        building: "1/1",
      };

      expect(findMatchingAddress(addresses, addressFields)).to.equal(
        addresses[2]
      );
    });

    test("matches - in address", () => {
      const addressFields: AddressLookupFields = {
        postcode: "SW1A 1AA",
        building: "1-1",
      };

      expect(findMatchingAddress(addresses, addressFields)).to.equal(
        addresses[3]
      );
    });
  });
});
