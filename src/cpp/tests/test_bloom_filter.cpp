#include "../bloom_filter.h"

#include "check.h"

int main() {
    std::vector<int> items = {3, 10, 42, 777, 5};
    BloomFilter b(items);
    for (int x : items) CHECK(b.mightContain(x));
    BloomFilter one(std::vector<int>{3});
    CHECK(!one.mightContain(5));
    return finish("bloom_filter");
}
