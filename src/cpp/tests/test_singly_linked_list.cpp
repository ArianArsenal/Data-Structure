#include "../singly_linked_list.h"

#include "check.h"

using V = std::vector<int>;

int main() {
    {
        SinglyLinkedList l({3, 7, 1});
        CHECK(l.toVector() == V({3, 7, 1}));
        l.insertHead(5);
        l.insertTail(9);
        CHECK(l.toVector() == V({5, 3, 7, 1, 9}));
        CHECK(l.size() == 5);
    }
    {
        SinglyLinkedList a, b;
        a.insertTail(4);
        b.insertHead(4);
        CHECK(a.toVector() == V({4}));
        CHECK(b.toVector() == V({4}));
    }
    {
        SinglyLinkedList l({3, 7, 1});
        l.insertAt(0, 0);
        l.insertAt(2, 5);
        l.insertAt(5, 8);
        CHECK(l.toVector() == V({0, 3, 5, 7, 1, 8}));
        bool threw = false;
        try {
            l.insertAt(7, 1);
        } catch (const std::out_of_range&) {
            threw = true;
        }
        CHECK(threw);
    }
    {
        SinglyLinkedList l({3, 7, 1, 7});
        CHECK(l.deleteValue(3));
        CHECK(l.deleteValue(7));
        CHECK(l.toVector() == V({1, 7}));
        CHECK(!l.deleteValue(42));
        CHECK(l.deleteValue(7));
        CHECK(l.deleteValue(1));
        CHECK(!l.deleteValue(1));
        CHECK(l.size() == 0);
    }
    {
        SinglyLinkedList l({3, 7, 1});
        CHECK(l.search(3) == 0);
        CHECK(l.search(1) == 2);
        CHECK(l.search(4) == -1);
    }
    {
        SinglyLinkedList l({1, 2, 3, 4});
        l.reverse();
        CHECK(l.toVector() == V({4, 3, 2, 1}));
        SinglyLinkedList e;
        e.reverse();
        CHECK(e.toVector().empty());
    }
    return finish("singly_linked_list");
}
