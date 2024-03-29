import {
    type GeneratedTransaction,
    type Wishlist,
} from '../../src/types/types';
import generateWishlists from '../../src/generation/generateWishlists';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import MockDate from 'mockdate';
import dayjs, { Dayjs } from 'dayjs';

beforeAll(() => {
    MockDate.set('2023-01-01');
});

afterAll(() => {
    MockDate.reset();
});

describe('generateWishlists', () => {
    it('Should generate wishlist transaction', () => {
        const transactions: GeneratedTransaction[] = [
            {
                id: '3fv423fv',
                title: 'Wishlist test',
                description: 'A wishlist test',
                date: dayjs('2023-07-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 500,
            },
            {
                id: 'f34t4fe',
                title: 'Another wishlist test',
                description: 'Yet another wishlist test',
                date: dayjs('2023-08-01'),
                amount: 200,
                tax_rate: 0.08875,
                total_amount: 182.25,
                balance: 682.25,
            },
            {
                id: 'f34t4df',
                title: 'Third wishlist test',
                description: 'A third wishlist test',
                date: dayjs('2023-09-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 882.25,
            },
        ];
        const skippedTransactions: GeneratedTransaction[] = [];
        const wishlist: Wishlist = {
            wishlist_amount: 150,
            wishlist_tax_rate: 0,
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
        };
        const fromDate: Dayjs = dayjs('2023-06-01');

        generateWishlists(
            transactions,
            skippedTransactions,
            wishlist,
            fromDate,
        );

        expect(transactions).toHaveLength(4);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction: GeneratedTransaction | undefined =
            transactions.find((t) => t.title === wishlist.wishlist_title);

        if (!wishlistTransaction) {
            throw new Error('Wishlist transaction not found');
        }

        expect(wishlistTransaction).toBeDefined();
        expect(wishlistTransaction.amount).toBe(-150);
        expect(wishlistTransaction.tax_rate).toBe(0);
        expect(wishlistTransaction.total_amount).toBe(-150);
        expect(wishlistTransaction.date).toEqual(dayjs('2023-07-01'));
    });

    it('Should generate wishlist transaction with a date available set', () => {
        const transactions: GeneratedTransaction[] = [
            {
                id: '3fv423fv',
                title: 'First wishlist test',
                description: 'The first wishlist test',
                date: dayjs('2023-07-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 500,
            },
            {
                id: 'f34t4fe',
                title: 'Second wishlist test',
                description: 'The second wishlist test',
                date: dayjs('2023-08-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 700,
            },
            {
                id: 'f34t4df',
                title: 'Third wishlist test',
                description: 'A third wishlist test',
                date: dayjs('2023-09-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 900,
            },
        ];
        const skippedTransactions: GeneratedTransaction[] = [];
        const wishlist: Wishlist = {
            wishlist_amount: 150,
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
            wishlist_date_available: '2023-08-15',
        };
        const fromDate: Dayjs = dayjs('2023-06-01');

        generateWishlists(
            transactions,
            skippedTransactions,
            wishlist,
            fromDate,
        );

        expect(transactions).toHaveLength(4);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction: GeneratedTransaction | undefined =
            transactions.find((t) => t.title === wishlist.wishlist_title);

        if (wishlistTransaction === undefined) {
            throw new Error('Wishlist transaction not found');
        }

        expect(wishlistTransaction).toBeDefined();
        expect(wishlistTransaction.amount).toBe(-150);
        expect(wishlistTransaction.date).toEqual(dayjs('2023-08-15'));
    });

    it('Should generate wishlist transaction with negative balances in the future', () => {
        const transactions: GeneratedTransaction[] = [
            {
                id: '3fv423fv',
                wishlist_id: 1,
                title: 'First wishlist test',
                description: 'A first wishlist test',
                date: dayjs('2023-07-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 500,
            },
            {
                id: 'f34t4fe',
                wishlist_id: 2,
                title: 'Second wishlist test',
                description: 'A second wishlist test',
                date: dayjs('2023-07-15'),
                amount: -200,
                tax_rate: 0,
                total_amount: -200,
                balance: 300,
            },
            {
                id: 'f34t4df',
                wishlist_id: 3,
                title: 'Third wishlist test',
                description: 'A third wishlist test',
                date: dayjs('2023-08-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 500,
            },
            {
                id: 'f34t4dz',
                wishlist_id: 4,
                title: 'Fourth wishlist test',
                description: 'A fourth wishlist test',
                date: dayjs('2023-09-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 700,
            },
            {
                id: 'f34t4yz',
                wishlist_id: 5,
                title: 'Fifth wishlist test',
                description: 'A fifth wishlist test',
                date: dayjs('2023-10-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 900,
            },
            {
                id: 'z34t4yz',
                wishlist_id: 6,
                title: 'Sixth wishlist test',
                description: 'A sixth wishlist test',
                date: dayjs('2023-11-01'),
                amount: 700,
                tax_rate: 0,
                total_amount: 700,
                balance: 1600,
            },
            {
                id: 'z34tzzz',
                wishlist_id: 7,
                title: 'Seventh wishlist test',
                description: 'A seventh wishlist test',
                date: dayjs('2023-12-01'),
                amount: 500,
                tax_rate: 0,
                total_amount: 500,
                balance: 2100,
            },
            {
                id: 'svsgvs',
                wishlist_id: 8,
                title: 'Eighth wishlist test',
                description: 'The eighth wishlist test',
                date: dayjs('2024-01-01'),
                amount: -500,
                tax_rate: 0,
                total_amount: 500,
                balance: 1600,
            },
            {
                id: 'svsgtt',
                wishlist_id: 9,
                title: 'Tenth wishlist test',
                description: 'The tenth wishlist test',
                date: dayjs('2024-02-01'),
                amount: 1000,
                tax_rate: 0,
                total_amount: 1000,
                balance: 2600,
            },
            {
                id: 'svsgty',
                wishlist_id: 10,
                title: 'Eleventh wishlist test',
                description: 'The eleventh wishlist test',
                date: dayjs('2024-03-01'),
                amount: -100,
                tax_rate: 0,
                total_amount: -100,
                balance: 2500,
            },
        ];
        const skippedTransactions: GeneratedTransaction[] = [];
        const wishlist: Wishlist = {
            wishlist_amount: 2000,
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
        };
        const fromDate: Dayjs = dayjs('2023-06-01');

        generateWishlists(
            transactions,
            skippedTransactions,
            wishlist,
            fromDate,
        );

        expect(transactions).toHaveLength(11);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction: GeneratedTransaction | undefined =
            transactions.find((t) => t.title === wishlist.wishlist_title);

        if (wishlistTransaction === undefined) {
            throw new Error('Wishlist transaction not found');
        }

        expect(wishlistTransaction).toBeDefined();
        expect(wishlistTransaction.amount).toBe(-2000);
        expect(wishlistTransaction.date).toEqual(dayjs('2024-02-01'));
    });

    it('Should generate wishlists correctly when the from date is greater than the wishlist date', () => {
        const transactions: GeneratedTransaction[] = [
            {
                id: '3fv423fv',
                title: 'First wishlist test',
                description: 'The first wishlist test',
                date: dayjs('2023-07-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 500,
            },
            {
                id: 'f34t4fe',
                title: 'Second wishlist test',
                description: 'The second wishlist test',
                date: dayjs('2023-08-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 700,
            },
            {
                id: 'f34t4df',
                title: 'Third wishlist test',
                description: 'The third wishlist test',
                date: dayjs('2023-09-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 900,
            },
        ];
        const skippedTransactions: GeneratedTransaction[] = [];
        const wishlist: Wishlist = {
            wishlist_amount: 150,
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
        };
        const fromDate: Dayjs = dayjs('2023-07-15');

        generateWishlists(
            transactions,
            skippedTransactions,
            wishlist,
            fromDate,
        );

        expect(transactions).toHaveLength(3);
        expect(skippedTransactions).toHaveLength(1);

        const wishlistTransaction: GeneratedTransaction | undefined =
            transactions.find((t) => t.title === wishlist.wishlist_title);

        expect(wishlistTransaction).toBeUndefined();
    });

    it("Should not generate wishlists when it can't be afforded", () => {
        const transactions: GeneratedTransaction[] = [
            {
                id: '3fv423fv',
                title: 'First wishlist test',
                description: 'The first wishlist test',
                date: dayjs('2023-07-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 500,
            },
            {
                id: 'f34t4fe',
                title: 'Second wishlist test',
                description: 'The second wishlist test',
                date: dayjs('2023-08-01'),
                amount: 200,
                tax_rate: 0,
                total_amount: 200,
                balance: 700,
            },
            {
                id: 'f34t4df',
                title: 'Third wishlist test',
                description: 'Third wishlist test',
                date: dayjs('2023-09-01'),
                amount: -200,
                tax_rate: 0,
                total_amount: -200,
                balance: 500,
            },
        ];
        const skippedTransactions: GeneratedTransaction[] = [];
        const wishlist = {
            wishlist_amount: 1150,
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
        };
        const fromDate: Dayjs = dayjs('2023-07-15');

        generateWishlists(
            transactions,
            skippedTransactions,
            wishlist,
            fromDate,
        );

        expect(transactions).toHaveLength(3);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction: GeneratedTransaction | undefined =
            transactions.find((t) => t.title === wishlist.wishlist_title);

        expect(wishlistTransaction).toBeUndefined();
    });
});
