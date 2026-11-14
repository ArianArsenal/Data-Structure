#include "../bst.h"

#include <random>
#include <set>

#include "check.h"

using V = std::vector<int>;

int main() {
    {
        BST t({50, 30, 70, 20, 40, 60, 80});
        CHECK(t.inorder() == V({20, 30, 40, 50, 60, 70, 80}));
        CHECK(!t.insert(40));
        CHECK(t.insert(45));
        CHECK(t.search(45));
        CHECK(!t.search(46));
    }
    {
        BST t({50, 30, 70, 20, 40, 60, 80});
        t.remove(20);
        t.remove(30);
        t.remove(50);
        t.remove(99);
        CHECK(t.inorder() == V({40, 60, 70, 80}));
    }
    {
        std::mt19937 rng(7);
        BST t;
        std::set<int> ref;
        for (int i = 0; i < 500; i++) {
            int k = rng() % 61;
            if (rng() % 10 < 6) {
                CHECK(t.insert(k) == (ref.count(k) == 0));
                ref.insert(k);
            } else {
                t.remove(k);
                ref.erase(k);
            }
            CHECK(t.inorder() == V(ref.begin(), ref.end()));
        }
    }
    {
        BST t({50, 30, 70, 20, 40, 60, 80});
        CHECK(t.minimum() == 20 && t.maximum() == 80);
        CHECK(t.successor(40) == 50 && t.successor(45) == 50 && !t.successor(80) && t.successor(5) == 20);
        CHECK(!BST().minimum());
    }
    return finish("bst");
}
