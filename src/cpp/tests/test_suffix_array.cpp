#include "../suffix_array.h"

#include "check.h"

int main() {
    SuffixArray s("banana");
    CHECK(s.getSa() == std::vector<int>({5, 3, 1, 0, 4, 2}));
    CHECK(s.getLcp() == std::vector<int>({0, 1, 3, 0, 0, 2}));
    int pos = s.search("ana");
    CHECK(pos == 1 || pos == 3);
    CHECK(s.search("nab") == -1 && s.search("b") == 0 && s.search("bananas") == -1);
    return finish("suffix_array");
}
