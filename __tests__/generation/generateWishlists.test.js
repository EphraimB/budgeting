import generateWishlists from '../../generation/generateWishlists';
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set('2023-01-01');
});

afterAll(() => {
    MockDate.reset();
});

describe('generateWishlists', () => {
    it('Should generate wishlist transaction', () => {
        const transactions = [
            { date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { date: new Date('2023-08-01'), amount: 200, balance: 700 },
            { date: new Date('2023-09-01'), amount: 200, balance: 900 },
        ];
        const skippedTransactions = [];
        const wishlist = {
            wishlist_amount: '150',
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
        };
        const fromDate = new Date('2023-06-01');

        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        expect(transactions).toHaveLength(4);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction = transactions.find(
            (t) => t.title === wishlist.wishlist_title
        );

        expect(wishlistTransaction).toBeDefined();
        expect(wishlistTransaction.amount).toBe(-150);
        expect(wishlistTransaction.date).toEqual(new Date('2023-07-01'));
    });

    it('Should generate wishlist transaction with a date available set', () => {
        const transactions = [
            { date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { date: new Date('2023-08-01'), amount: 200, balance: 700 },
            { date: new Date('2023-09-01'), amount: 200, balance: 900 },
        ];
        const skippedTransactions = [];
        const wishlist = {
            wishlist_amount: '150',
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
            wishlist_date_available: '2023-08-15',
        };
        const fromDate = new Date('2023-06-01');

        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        expect(transactions).toHaveLength(4);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction = transactions.find(
            (t) => t.title === wishlist.wishlist_title
        );

        expect(wishlistTransaction).toBeDefined();
        expect(wishlistTransaction.amount).toBe(-150);
        expect(wishlistTransaction.date).toEqual(new Date('2023-08-15'));
    });

    it('Should generate wishlist transaction with negative balances in the future', () => {
        const transactions = [
            { date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { date: new Date('2023-07-15'), amount: -200, balance: 300 },
            { date: new Date('2023-08-01'), amount: 200, balance: 500 },
            { date: new Date('2023-09-01'), amount: 200, balance: 700 },
            { date: new Date('2023-10-01'), amount: 200, balance: 900 },
            { date: new Date('2023-11-01'), amount: 700, balance: 1600 },
            { date: new Date('2023-12-01'), amount: 500, balance: 2100 },
            { date: new Date('2024-01-01'), amount: -500, balance: 1600 },
            { date: new Date('2024-02-01'), amount: 1000, balance: 2600 },
            { date: new Date('2024-03-01'), amount: -100, balance: 2500 },
        ];
        const skippedTransactions = [];
        const wishlist = {
            wishlist_amount: '2000',
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
        };
        const fromDate = new Date('2023-06-01');

        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        expect(transactions).toHaveLength(11);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction = transactions.find(
            (t) => t.title === wishlist.wishlist_title
        );

        expect(wishlistTransaction).toBeDefined();
        expect(wishlistTransaction.amount).toBe(-2000);
        expect(wishlistTransaction.date).toEqual(new Date('2024-02-01'));
    });

    it('Should generate wishlists correctly when the from date is greater than the wishlist date', () => {
        const transactions = [
            { date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { date: new Date('2023-08-01'), amount: 200, balance: 700 },
            { date: new Date('2023-09-01'), amount: 200, balance: 900 },
        ];
        const skippedTransactions = [];
        const wishlist = {
            wishlist_amount: '150',
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
        };
        const fromDate = new Date('2023-07-15');

        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        expect(transactions).toHaveLength(3);
        expect(skippedTransactions).toHaveLength(1);

        const wishlistTransaction = transactions.find(
            (t) => t.title === wishlist.wishlist_title
        );

        expect(wishlistTransaction).toBeUndefined();
    });

    it('Should not generate wishlists when it can\'t be afforded', () => {
        const transactions = [
            { date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { date: new Date('2023-08-01'), amount: 200, balance: 700 },
            { date: new Date('2023-09-01'), amount: -200, balance: 500 },
        ];
        const skippedTransactions = [];
        const wishlist = {
            wishlist_amount: '1150',
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
        };
        const fromDate = new Date('2023-07-15');

        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        expect(transactions).toHaveLength(3);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction = transactions.find(
            (t) => t.title === wishlist.wishlist_title
        );

        expect(wishlistTransaction).toBeUndefined();
    });
});
