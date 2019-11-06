#include <stdio.h>
#include <stdlib.h>

int main(){
int n;
int i;
int x;
int a[10000];
int big;
int middle;
int small;
scanf("%d\n",&n);
for(i=0;i<n;i++){
scanf("%d",&x);
a[i]=x;
}
	if(a[0]>a[1]){
		big=a[0];
		small=a[n-1];
	}
	else{
		big=a[n-1];
		small=a[0];
	}
	if(n%2 == 0){
	middle= (a[n/2]+a[n/2-1])/2;
	if((a[n/2] % 2 == 0 && a[n/2-1] % 2 ==0) || (a[n/2] %2 !=0 && a[n/2-1]!=0)){
		printf("%d %d %d",big,small,middle);

	}
	else {
		printf("%d %d %.1f",big,small,middle);
	}
}
else {
	middle = a[(n-1)/2];
	printf("%d %d %d",big,small,middle);

}
return 0;
}