for i in {1..1000}
do
   number=$((10000 + $i))
   url="http://data.openaustralia.org/members/images/mpsL/$number.jpg"
   wget $url
done
