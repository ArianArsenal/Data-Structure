#include "../trie.h"

#include "check.h"

int main() {
    Trie t({"car", "cart", "cat", "dog", "do"});
    CHECK(t.search("car") && t.search("do") && !t.search("ca"));
    CHECK(t.startsWith("ca") && !t.startsWith("cow") && !t.search("carts"));
    t.insert("ca");
    CHECK(t.search("ca"));
    return finish("trie");
}
